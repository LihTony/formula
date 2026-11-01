# FORMULA Detailing — сайт

Статический сайт: **HTML + CSS + JS**, форма записи — **PHP** (`send.php`). Вид 1:1 с прототипом Lovable.

## Структура
```
index.html            — вся страница (шапка, hero, услуги, калькулятор, о нас, контакты, запись, подвал)
send.php              — приём заявок → Telegram (+ e-mail, + журнал storage/bookings.log)
config.sample.php     — шаблон настроек; скопировать в config.php и заполнить
assets/js/prices.js   — ПРАЙС (меняйте цены здесь)
assets/js/main.js     — калькулятор, меню, выпадающий список, отправка формы, уведомления
assets/css/style.css  — готовый CSS (собран из assets/css/src/input.css, редактировать не нужно)
assets/img/           — фото
```

## Запуск на хостинге
1. Загрузить всё содержимое папки (кроме `node_modules`) в корень сайта. Нужен PHP 7.4+ (curl желателен).
2. Скопировать `config.sample.php` → `config.php`, вписать `telegram_token` и `telegram_chat_id`
   (бот создаётся у @BotFather; chat_id виден в `https://api.telegram.org/bot<ТОКЕН>/getUpdates` после сообщения боту).
3. Папка `storage/` должна быть доступна PHP на запись. Все заявки дублируются в `storage/bookings.log`.
4. Apache: `.htaccess` уже закрывает `config.php` и `storage/`. **Nginx** — добавьте:
   ```
   location ~ ^/(config(\.sample)?\.php|storage|node_modules|assets/css/src)(/|$) { return 404; }
   location ~ \.php$ { include fastcgi_params; fastcgi_pass unix:/run/php/php-fpm.sock; fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; }
   ```
5. После получения домена замените `og:image` и `image` в JSON-LD в `<head>` на абсолютный адрес картинки
   и добавьте `<link rel="canonical">`.

Локальная проверка: `php -S localhost:8000` в папке сайта.

## Что где править
- **Цены/услуги**: `assets/js/prices.js`. Цены «от …» на 4 карточках раздела «Услуги» (`index.html`, `id="services"`) вписаны вручную.
- **Телефоны/адрес/ссылки**: поиск по `index.html` (`+375`, `Грамадовская`, `formula_molo`) + JSON-LD в `<head>`.
- **Стили**: сайт использует Tailwind CSS (как и прототип). Если правите классы в `index.html`/`main.js`,
  пересоберите CSS: `npm install` (один раз) и `npm run build:css`. Без правки классов Node не нужен.
