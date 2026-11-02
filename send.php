<?php
/**
 * Приём заявок с формы «Онлайн-запись».
 * Принимает JSON (POST), проверяет данные, сохраняет в storage/bookings.log
 * и отправляет в Telegram (и, если указано, на e-mail). Настройки — в config.php.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(array $data, int $code = 200): void
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(['ok' => false, 'error' => 'method'], 405);
}

$cfgFile = __DIR__ . '/config.php';
$cfg = is_file($cfgFile) ? (require $cfgFile) : [];
$cfg += [
    'telegram_token' => '', 'telegram_chat_id' => '', 'notify_email' => '',
    'mail_from' => 'no-reply@localhost', 'rate_limit_max' => 5, 'rate_limit_window' => 600,
];

// --- вход: JSON или обычная форма
$raw = file_get_contents('php://input') ?: '';
$in = json_decode($raw, true);
if (!is_array($in)) {
    $in = $_POST;
}
$str = static fn($k): string => is_string($in[$k] ?? null) ? trim($in[$k]) : '';

// --- honeypot: боты заполняют скрытое поле. Отвечаем «успехом», но ничего не отправляем
if ($str('website') !== '') {
    respond(['ok' => true, 'delivered' => false]);
}

$name = $str('name');
$phone = $str('phone');
$service = $str('service');
$comment = $str('comment');
$car = $str('car');         // марка и модель (необязательно)
$date = $str('date');       // желаемый день, YYYY-MM-DD (необязательно)
$time = $str('time');       // желаемое время, HH:MM (необязательно)
$calc = $str('calc');       // состав расчёта из калькулятора (необязательно)
$source = $str('source');   // с какой кнопки пришла заявка

// --- валидация (те же правила, что в assets/js/main.js)
$len = static fn(string $s): int => mb_strlen($s, 'UTF-8');
$errors = [];
if ($len($name) < 2) $errors['name'] = 'Укажите имя';
elseif ($len($name) > 60) $errors['name'] = 'Слишком длинное имя';
// Номер: белорусский — ровно 9 цифр после кода страны (375… / 80… / без кода). Иностранный — 10–15 цифр.
$digits = preg_replace('/\D/', '', $phone);
if ($len($phone) > 25) {
    $errors['phone'] = 'Проверьте номер';
} else {
    if (strpos($digits, '375') === 0) $national = substr($digits, 3);
    elseif (strpos($digits, '80') === 0) $national = substr($digits, 2);
    elseif (strlen($digits) === 9) $national = $digits;
    else $national = null;
    $by_ok = $national !== null && strlen($national) === 9;
    $foreign_ok = $national === null && strlen($digits) >= 10 && strlen($digits) <= 15;
    if (!$by_ok && !$foreign_ok) {
        $errors['phone'] = 'Укажите корректный телефон';
    } elseif ($by_ok) {
        $phone = '+375' . $national; // единый формат для менеджера: +375291234567
    }
}
if ($service === '' ) $errors['service'] = 'Выберите услугу';
elseif ($len($service) > 200) $errors['service'] = 'Слишком длинное значение';
if ($len($comment) > 1000) $errors['comment'] = 'Не более 1000 символов';
if ($len($car) > 80) $errors['car'] = 'Не более 80 символов';
if ($date !== '') {
    $dp = explode('-', $date);
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || !checkdate((int)$dp[1], (int)$dp[2], (int)$dp[0])) {
        $errors['date'] = 'Некорректная дата';
    }
}
if ($time !== '' && !preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $time)) $errors['time'] = 'Некорректное время';
if ($len($calc) > 1500) $errors['calc'] = 'Слишком длинный расчёт';
$source = mb_substr($source, 0, 60, 'UTF-8');
if ($errors) {
    respond(['ok' => false, 'errors' => $errors], 422);
}

// --- ограничение частоты по IP
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rlFile = sys_get_temp_dir() . '/formula_rl_' . md5($ip) . '.json';
$now = time();
$hits = [];
if (is_file($rlFile)) {
    $hits = json_decode((string)file_get_contents($rlFile), true) ?: [];
    $hits = array_values(array_filter($hits, static fn($t) => $t > $now - (int)$cfg['rate_limit_window']));
}
if (count($hits) >= (int)$cfg['rate_limit_max']) {
    respond(['ok' => false, 'error' => 'rate_limit'], 429);
}
$hits[] = $now;
@file_put_contents($rlFile, json_encode($hits), LOCK_EX);

// желаемый визит одной строкой: «05.11.2026, 14:00» (или только день / только время)
$when = '';
if ($date !== '') { $when = date('d.m.Y', strtotime($date)); }
if ($time !== '') { $when .= ($when !== '' ? ', ' : '') . $time; }

// --- журнал заявок (резервная копия на случай сбоя Telegram)
$logDir = __DIR__ . '/storage';
if (!is_dir($logDir)) {
    @mkdir($logDir, 0755, true);
}
$logged = (bool)@file_put_contents(
    $logDir . '/bookings.log',
    json_encode(['time' => date('c'), 'ip' => $ip, 'name' => $name, 'phone' => $phone, 'service' => $service, 'car' => $car, 'when' => $when, 'calc' => $calc, 'source' => $source, 'comment' => $comment], JSON_UNESCAPED_UNICODE) . PHP_EOL,
    FILE_APPEND | LOCK_EX
);

// --- отправка в Telegram
$h = static fn(string $s): string => htmlspecialchars($s, ENT_NOQUOTES | ENT_SUBSTITUTE, 'UTF-8');
$text = "<b>Новая заявка — FORMULA Detailing</b>\n"
    . 'Имя: ' . $h($name) . "\n"
    . 'Телефон: ' . $h($phone) . "\n"
    . 'Услуга: ' . $h($service)
    . ($car !== '' ? "\nАвто: " . $h($car) : '')
    . ($when !== '' ? "\nЖелаемый визит: " . $h($when) : '')
    . ($calc !== '' ? "\n\n<b>Расчёт с сайта</b>\n" . $h($calc) : '')
    . ($comment !== '' ? "\n\nКомментарий: " . $h($comment) : '')
    . ($source !== '' ? "\n\nОткуда: " . $h($source) : '');

$delivered = false;
if ($cfg['telegram_token'] !== '' && $cfg['telegram_chat_id'] !== '') {
    $url = 'https://api.telegram.org/bot' . $cfg['telegram_token'] . '/sendMessage';
    $payload = http_build_query([
        'chat_id' => $cfg['telegram_chat_id'], 'text' => $text, 'parse_mode' => 'HTML', 'disable_web_page_preview' => 1,
    ]);
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $payload, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10]);
        $resp = curl_exec($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);
        $delivered = $resp !== false && $code === 200;
    } else {
        $ctx = stream_context_create(['http' => ['method' => 'POST', 'header' => 'Content-Type: application/x-www-form-urlencoded', 'content' => $payload, 'timeout' => 10]]);
        $delivered = @file_get_contents($url, false, $ctx) !== false;
    }
}

// --- e-mail (по желанию)
if ($cfg['notify_email'] !== '') {
    $subject = '=?UTF-8?B?' . base64_encode('Новая заявка — FORMULA Detailing') . '?=';
    $body = "Имя: $name\nТелефон: $phone\nУслуга: $service\nАвто: $car\nЖелаемый визит: $when\n"
        . ($calc !== '' ? "Расчёт:\n$calc\n" : '') . "Комментарий: $comment\nОткуда: $source\n";
    $headers = 'From: ' . $cfg['mail_from'] . "\r\nContent-Type: text/plain; charset=UTF-8";
    $delivered = @mail($cfg['notify_email'], $subject, $body, $headers) || $delivered;
}

// Успех, если заявка хоть где-то сохранена: клиенту не нужно знать про сбой Telegram
if (!$delivered && !$logged) {
    respond(['ok' => false, 'error' => 'delivery'], 500);
}
respond(['ok' => true, 'delivered' => $delivered]);
