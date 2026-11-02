/*
 * FORMULA Detailing — скрипты сайта (без библиотек).
 * Разделы: иконки · шапка · мобильное меню · уведомления · калькулятор · форма записи.
 * Цены и услуги берутся из prices.js (window.FORMULA).
 */
(function () {
  'use strict';

  var F = window.FORMULA;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---------- Иконки (lucide) ---------- */
  var ICON_PATHS = {"Check": "<path d=\"M20 6 9 17l-5-5\"></path>", "Plus": "<path d=\"M5 12h14\"></path><path d=\"M12 5v14\"></path>", "X": "<path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path>", "Loader2": "<path d=\"M21 12a9 9 0 1 1-6.219-8.56\"></path>", "ChevronDown": "<path d=\"m6 9 6 6 6-6\"></path>"};
  function icon(name, cls) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide ' + cls + '" aria-hidden="true">' +
      ICON_PATHS[name] + '</svg>';
  }

  var BODY_PATHS = {
    sedan: 'M4 30 C4 27 7 25.5 12 25 L26 23 C32 17.5 40 15 50 15 C60 15 67 17.5 73 22 L86 24 C90 24.8 92 27 92 30 L92 32 L82 32 A6.5 6.5 0 0 0 69 32 L29 32 A6.5 6.5 0 0 0 16 32 L4 32 Z',
    crossover: 'M4 30 C4 25.5 6 23.5 11 22.5 L22 21 C27 13.5 34 10.5 46 10.5 L68 10.5 C74 10.5 78 13 82 19.5 L88 21 C91 22 92 24.5 92 28 L92 32 L82 32 A6.5 6.5 0 0 0 69 32 L29 32 A6.5 6.5 0 0 0 16 32 L4 32 Z',
    suv: 'M4 31 L4 14 C4 9.5 7 7 12 7 L76 7 C80 7 82.5 9 84.5 13 L90.5 22 C91.6 23.6 92 25 92 27 L92 32 L82 32 A6.5 6.5 0 0 0 69 32 L29 32 A6.5 6.5 0 0 0 16 32 L4 32 Z'
  };
  function bodyIcon(type, cls) {
    return '<svg viewBox="0 0 96 40" class="' + cls + '" aria-hidden="true"><path d="' + BODY_PATHS[type] + '" class="fill-current"></path>' +
      '<circle cx="22.5" cy="32" r="5" class="fill-current"></circle><circle cx="75.5" cy="32" r="5" class="fill-current"></circle>' +
      '<circle cx="22.5" cy="32" r="2" class="fill-background"></circle><circle cx="75.5" cy="32" r="2" class="fill-background"></circle></svg>';
  }

  /* ---------- Шапка: фон при прокрутке ---------- */
  var header = $('#siteHeader');
  var HDR_TOP = ['border-transparent', 'bg-transparent'];
  var HDR_SCROLLED = ['border-border', 'bg-background/85', 'backdrop-blur-xl'];
  var headerScrolled = null;
  function onScroll() {
    var s = window.scrollY > 24;
    if (s === headerScrolled) return;
    headerScrolled = s;
    HDR_TOP.concat(HDR_SCROLLED).forEach(function (c) { header.classList.remove(c); });
    (s ? HDR_SCROLLED : HDR_TOP).forEach(function (c) { header.classList.add(c); });
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Мобильное меню ---------- */
  var menu = $('#mobileMenu');
  var menuBtn = $('#menuBtn');
  var menuOverlay = $('#menuOverlay');
  var menuPanel = $('#menuPanel');
  var menuOpen = false;
  var menuTimer = null;

  function lockScroll(lock) {
    var root = document.documentElement;
    if (lock) {
      var sw = window.innerWidth - root.clientWidth;
      document.body.style.overflow = 'hidden';
      if (sw > 0) document.body.style.paddingRight = sw + 'px';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  }
  function setMenu(open) {
    if (open === menuOpen) return;
    menuOpen = open;
    clearTimeout(menuTimer);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      menu.hidden = false;
      menuOverlay.setAttribute('data-state', 'open');
      menuPanel.setAttribute('data-state', 'open');
      lockScroll(true);
      menuPanel.focus();
    } else {
      menuOverlay.setAttribute('data-state', 'closed');
      menuPanel.setAttribute('data-state', 'closed');
      lockScroll(false);
      menuTimer = setTimeout(function () { menu.hidden = true; }, 300);
    }
  }
  menuBtn.addEventListener('click', function () { setMenu(true); });
  menuOverlay.addEventListener('click', function () { setMenu(false); menuBtn.focus(); });
  $$('[data-close]', menu).forEach(function (el) {
    el.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuOpen) { setMenu(false); menuBtn.focus(); }
    if (e.key === 'Tab' && menuOpen) {
      var f = $$('a[href], button:not([disabled])', menuPanel);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === menuPanel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('resize', function () { if (menuOpen && window.innerWidth >= 1024) setMenu(false); });

  /* ---------- Уведомления (toast) ---------- */
  var toaster = $('#toaster');
  var TOAST_ICON = {
    success: '<svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/></svg>',
    error: '<svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>'
  };
  function toast(type, title, desc) {
    var el = document.createElement('div');
    el.setAttribute('role', 'status');
    el.setAttribute('data-state', 'open');
    el.className = 'pointer-events-auto flex items-center gap-2.5 rounded-lg border border-border bg-background p-4 text-[13px] text-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2';
    el.innerHTML = '<span class="shrink-0">' + TOAST_ICON[type] + '</span><div class="flex flex-col gap-0.5"><div class="font-medium leading-snug">' + esc(title) +
      '</div>' + (desc ? '<div class="leading-snug text-muted-foreground">' + esc(desc) + '</div>' : '') + '</div>';
    toaster.appendChild(el);
    setTimeout(function () {
      el.setAttribute('data-state', 'closed');
      setTimeout(function () { el.remove(); }, 250);
    }, 4000);
  }

  /* ---------- Калькулятор цен ---------- */
  var state = { body: 'sedan', category: 'wash', selected: [], roofRack: false };
  var elBody = $('#bodySwitch'), elTabs = $('#catTabs'), elGrid = $('#svcGrid');
  var elList = $('#calcList'), elTotal = $('#calcTotal'), elCalcBody = $('#calcBody');
  var elClear = $('#calcClear'), elRoof = $('#roofSwitch'), elBook = $('#calcBook');
  var lastTotal = null;

  function catById(id) { return F.CATEGORIES.filter(function (c) { return c.id === id; })[0] || F.CATEGORIES[0]; }
  function svcById(id) { return F.ALL_SERVICES.filter(function (s) { return s.id === id; })[0]; }
  function isOn(id) { return state.selected.indexOf(id) !== -1; }

  // Тип кузова
  var BODY_BTN = 'clip-corner group relative flex items-center gap-5 border bg-background p-5 text-left transition-all duration-300 ';
  function renderBodies() {
    elBody.innerHTML = F.BODY_TYPES.map(function (b) {
      return '<button type="button" role="radio" data-body="' + b.id + '" aria-checked="false" class="' + BODY_BTN + '">' +
        '<span class="absolute left-0 top-0 h-full w-1 transition-colors" data-bar></span>' +
        bodyIcon(b.id, 'w-auto h-9 shrink-0 transition-colors') +
        '<span class="min-w-0"><span class="block font-display text-sm font-bold uppercase tracking-wider text-foreground">' + esc(b.short) +
        '</span><span class="mt-1 block text-xs leading-snug text-muted-foreground">' + esc(b.label) + '</span></span></button>';
    }).join('');
    updateBodies();
  }
  function updateBodies() {
    $$('[data-body]', elBody).forEach(function (btn) {
      var active = btn.getAttribute('data-body') === state.body;
      btn.setAttribute('aria-checked', active ? 'true' : 'false');
      btn.className = BODY_BTN + (active ? 'border-primary shadow-glow' : 'border-border hover:border-border-strong');
      $('[data-bar]', btn).className = 'absolute left-0 top-0 h-full w-1 transition-colors ' + (active ? 'bg-primary' : 'bg-transparent');
      $('svg', btn).setAttribute('class', 'w-auto h-9 shrink-0 transition-colors ' + (active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'));
    });
  }

  // Вкладки категорий
  var TAB = 'flex h-12 items-center gap-2 border px-5 font-display text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition-all ';
  function renderTabs() {
    elTabs.innerHTML = F.CATEGORIES.map(function (c) {
      return '<button type="button" role="tab" data-cat="' + c.id + '" aria-selected="false" class="' + TAB + '">' + esc(c.title) + '<span data-count></span></button>';
    }).join('');
    updateTabs();
  }
  function updateTabs() {
    $$('[data-cat]', elTabs).forEach(function (btn) {
      var c = catById(btn.getAttribute('data-cat'));
      var active = c.id === state.category;
      var count = c.services.filter(function (s) { return isOn(s.id); }).length;
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
      btn.className = TAB + (active ? 'border-foreground bg-foreground text-background' : 'border-border bg-background text-muted-foreground hover:border-border-strong hover:text-foreground');
      $('[data-count]', btn).outerHTML = count > 0
        ? '<span data-count class="grid size-5 place-items-center bg-primary text-[0.6rem] text-primary-foreground">' + count + '</span>'
        : '<span data-count hidden></span>';
    });
  }

  // Карточки услуг
  var CARD = 'card-interactive group relative flex flex-col border bg-background p-6 text-left ';
  var CHECK = 'grid size-7 shrink-0 place-items-center border transition-all ';
  var CELL = 'border-r border-border py-1.5 text-center font-display text-xs last:border-r-0 transition-colors ';
  var PRICE_CLS = 'animate-fade-up font-display text-3xl font-bold text-primary [animation-duration:0.45s]';
  function renderGrid() {
    var col = F.columnOf(state.body);
    elGrid.innerHTML = catById(state.category).services.map(function (s) {
      var cells = s.flat
        ? '<p class="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Единая цена для всех кузовов</p>'
        : '<div class="mt-3 grid grid-cols-3 border border-border">' + s.prices.map(function (p, i) {
            return '<span data-cell="' + i + '" class="' + CELL + (i === col ? 'bg-primary/15 font-bold text-primary' : 'text-muted-foreground') + '">' + p + '</span>';
          }).join('') + '</div>';
      return '<button type="button" data-svc="' + s.id + '" aria-pressed="false" class="' + CARD + '">' +
        '<div class="flex items-start justify-between gap-4"><h3 class="font-display text-base font-bold uppercase leading-snug text-foreground">' + esc(s.name) + '</h3>' +
        '<span data-check class="' + CHECK + '"></span></div>' +
        (s.description ? '<p class="mt-2 text-sm leading-relaxed text-muted-foreground">' + esc(s.description) + '</p>' : '') +
        '<div class="mt-auto pt-6"><div class="flex items-baseline gap-2">' +
        (s.from ? '<span class="text-sm text-muted-foreground">от</span>' : '') +
        '<span data-price class="' + PRICE_CLS + '">' + s.prices[col] + '</span><span class="font-display text-sm text-foreground">руб</span></div>' + cells + '</div></button>';
    }).join('');
    updateCards();
  }
  function updateCards() {
    $$('[data-svc]', elGrid).forEach(function (card) {
      var on = isOn(card.getAttribute('data-svc'));
      card.setAttribute('aria-pressed', on ? 'true' : 'false');
      card.className = CARD + (on ? 'border-primary shadow-glow' : 'border-border');
      var chk = $('[data-check]', card);
      chk.className = CHECK + (on ? 'border-primary bg-primary text-primary-foreground' : 'border-border-strong text-muted-foreground group-hover:border-primary group-hover:text-primary');
      chk.innerHTML = on ? icon('Check', 'lucide-check size-4') : icon('Plus', 'lucide-plus size-4');
    });
  }
  // смена типа кузова: меняем только цифры (карточки остаются на месте), цена «вспыхивает» заново
  function updateCardPrices() {
    var col = F.columnOf(state.body);
    $$('[data-svc]', elGrid).forEach(function (card) {
      var s = svcById(card.getAttribute('data-svc'));
      var p = $('[data-price]', card);
      var fresh = p.cloneNode(false);
      fresh.textContent = s.prices[col];
      p.parentNode.replaceChild(fresh, p);
      $$('[data-cell]', card).forEach(function (cell) {
        var i = +cell.getAttribute('data-cell');
        cell.className = CELL + (i === col ? 'bg-primary/15 font-bold text-primary' : 'text-muted-foreground');
      });
    });
  }

  // Блок «Ваш расчёт»
  function updateEstimate() {
    var est = F.calcEstimate(state.selected, state.body, state.roofRack);
    var info = F.BODY_TYPES[F.columnOf(state.body)];
    elCalcBody.innerHTML = bodyIcon(state.body, 'w-auto h-5 text-primary') + esc(info.short);
    elClear.hidden = state.selected.length === 0;

    var html = '';
    if (!est.items.length) {
      html = '<li class="text-sm text-muted-foreground">Отметьте услуги, чтобы рассчитать стоимость.</li>';
    } else {
      html = est.items.map(function (it) {
        return '<li class="flex items-start justify-between gap-3 text-sm"><span class="flex items-start gap-2 text-foreground">' +
          '<button type="button" data-remove="' + it.service.id + '" aria-label="Убрать «' + esc(it.service.name) + '»" class="mt-0.5 text-muted-foreground transition-colors hover:text-primary">' +
          icon('X', 'lucide-x size-3.5') + '</button>' + esc(it.service.name) + '</span>' +
          '<span class="shrink-0 font-display text-foreground">' + F.formatPrice(it.price, it.service.from) + '</span></li>';
      }).join('');
    }
    if (est.roofRackApplied) {
      html += '<li class="flex justify-between text-sm text-muted-foreground"><span>Багажник на крыше</span><span class="font-display">+' + F.ROOF_RACK_SURCHARGE + ' руб</span></li>';
    }
    elList.innerHTML = html;

    var anim = lastTotal !== est.total;
    lastTotal = est.total;
    elTotal.innerHTML = (est.hasFrom ? '<span class="mr-1 text-sm text-muted-foreground">от</span>' : '') +
      '<span class="' + (anim ? 'animate-fade-up ' : '') + 'inline-block text-4xl font-bold text-primary [animation-duration:0.4s]">' + est.total + '</span><span class="ml-1 text-sm">руб</span>';

    elRoof.setAttribute('aria-checked', state.roofRack ? 'true' : 'false');
    elRoof.setAttribute('data-state', state.roofRack ? 'checked' : 'unchecked');
    $('span', elRoof).setAttribute('data-state', state.roofRack ? 'checked' : 'unchecked');
    elBook.disabled = est.items.length === 0;
    updateBar(est);
    return est;
  }

  function toggleService(id) {
    var i = state.selected.indexOf(id);
    if (i === -1) state.selected.push(id); else state.selected.splice(i, 1);
    updateCards(); updateTabs(); updateEstimate();
  }
  function setBody(id) {
    if (id === state.body) return;
    state.body = id;
    updateBodies(); updateCardPrices(); updateEstimate();
  }
  function setCategory(id) {
    state.category = id;
    updateTabs(); renderGrid();
  }

  elBody.addEventListener('click', function (e) {
    var b = e.target.closest('[data-body]'); if (b) setBody(b.getAttribute('data-body'));
  });
  elTabs.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cat]'); if (b) setCategory(b.getAttribute('data-cat'));
  });
  elGrid.addEventListener('click', function (e) {
    var b = e.target.closest('[data-svc]'); if (b) toggleService(b.getAttribute('data-svc'));
  });
  elList.addEventListener('click', function (e) {
    var b = e.target.closest('[data-remove]'); if (b) toggleService(b.getAttribute('data-remove'));
  });
  elClear.addEventListener('click', function () {
    state.selected = []; updateCards(); updateTabs(); updateEstimate();
  });
  elRoof.addEventListener('click', function () {
    state.roofRack = !state.roofRack; updateEstimate();
  });
  // клик по карточкам раздела «Услуги»
  $$('#services [data-cat]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setCategory(btn.getAttribute('data-cat'));
      $('#prices').scrollIntoView({ behavior: 'smooth' });
    });
  });

  renderBodies(); renderTabs(); renderGrid(); updateEstimate();

  /* ---------- Телефон: маска +375 (XX) XXX-XX-XX ---------- */
  // Национальная часть номера (9 цифр) без кода страны. Понимает +375…, 375…, 80…, 29…
  function phoneDigits(v) {
    var d = String(v).replace(/\D/g, '');
    if (d.indexOf('375') === 0) d = d.slice(3);
    else if (d.indexOf('80') === 0) d = d.slice(2);
    return d.slice(0, 9);
  }
  // Разделители добавляются только когда есть следующая цифра, поэтому Backspace работает без «залипания»
  function formatPhone(v) {
    var d = phoneDigits(v), out = '+375 ';
    if (!d.length) return out;
    out += '(' + d.slice(0, 2);
    if (d.length > 2) out += ') ' + d.slice(2, 5);
    if (d.length > 5) out += '-' + d.slice(5, 7);
    if (d.length > 7) out += '-' + d.slice(7, 9);
    return out;
  }
  function bindPhone(input) {
    input.addEventListener('input', function () {
      var f = formatPhone(input.value);
      if (input.value !== f) input.value = f;
    });
    input.addEventListener('focus', function () {
      if (!phoneDigits(input.value).length) input.value = '+375 ';
    });
  }

  /* ---------- Форма записи ---------- */
  var CONSULT_OPTION = 'Нужна консультация';
  var PHONE_DEFAULT = '+375 ';
  var form = $('#bookingForm');
  var fName = form.elements['name'], fPhone = form.elements['phone'], fComment = form.elements['comment'];
  var svcTrigger = $('#svcTrigger'), svcValue = $('#svcValue'), svcList = $('#svcList'), svcInput = $('#svcInput');
  var FIELD_ERR = 'border-primary';
  bindPhone(fPhone);

  /* Выпадающий список услуг */
  var ITEM = 'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground';
  var options = [];
  function buildOptions() {
    var html = '';
    function opt(v) {
      options.push(v);
      return '<div role="option" id="svcOpt' + (options.length - 1) + '" data-value="' + esc(v) + '" aria-selected="false" class="' + ITEM + '">' + esc(v) +
        '<span class="absolute right-2 flex h-3.5 w-3.5 items-center justify-center" data-ind></span></div>';
    }
    html += opt(CONSULT_OPTION);
    F.CATEGORIES.forEach(function (c) {
      html += '<div role="group" aria-label="' + esc(c.title) + '"><div class="eyebrow px-2 pb-1.5 pt-3 text-muted-foreground">' + esc(c.title) + '</div>' +
        c.services.map(function (s) { return opt(s.name); }).join('') + '</div>';
    });
    svcList.innerHTML = html;
  }
  buildOptions();

  var svcOpen = false, svcActive = -1, svcTimer = null;
  function optEls() { return $$('[role=option]', svcList); }
  function setActive(i) {
    var els = optEls();
    if (!els.length) return;
    svcActive = (i + els.length) % els.length;
    els.forEach(function (el, k) { el.classList.toggle('bg-accent', k === svcActive); });
    svcTrigger.setAttribute('aria-activedescendant', els[svcActive].id);
    els[svcActive].scrollIntoView({ block: 'nearest' });
  }
  function setSvcOpen(open) {
    if (open === svcOpen) return;
    svcOpen = open;
    clearTimeout(svcTimer);
    svcTrigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    svcTrigger.setAttribute('data-state', open ? 'open' : 'closed');
    if (open) {
      svcList.hidden = false;
      svcList.setAttribute('data-state', 'open');
      var cur = options.indexOf(svcInput.value);
      setActive(cur === -1 ? 0 : cur);
    } else {
      svcList.setAttribute('data-state', 'closed');
      svcTrigger.removeAttribute('aria-activedescendant');
      svcTimer = setTimeout(function () { svcList.hidden = true; }, 150);
    }
  }
  function setService(v) {
    svcInput.value = v;
    if (v) { svcValue.textContent = v; svcTrigger.removeAttribute('data-placeholder'); }
    else { svcValue.textContent = 'Выберите услугу'; svcTrigger.setAttribute('data-placeholder', ''); }
    optEls().forEach(function (el) {
      var sel = el.getAttribute('data-value') === v;
      el.setAttribute('aria-selected', sel ? 'true' : 'false');
      $('[data-ind]', el).innerHTML = sel ? icon('Check', 'lucide-check h-4 w-4') : '';
    });
  }
  svcTrigger.addEventListener('click', function () { setSvcOpen(!svcOpen); });
  svcTrigger.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!svcOpen) setSvcOpen(true); else setActive(svcActive + (e.key === 'ArrowDown' ? 1 : -1));
    } else if ((e.key === 'Enter' || e.key === ' ') && svcOpen) {
      e.preventDefault();
      var el = optEls()[svcActive];
      if (el) { setService(el.getAttribute('data-value')); }
      setSvcOpen(false);
    } else if (e.key === 'Escape' && svcOpen) {
      e.preventDefault(); e.stopPropagation(); setSvcOpen(false);
    } else if (e.key === 'Tab' && svcOpen) {
      setSvcOpen(false);
    }
  });
  svcList.addEventListener('click', function (e) {
    var el = e.target.closest('[role=option]');
    if (!el) return;
    setService(el.getAttribute('data-value'));
    setSvcOpen(false);
    svcTrigger.focus();
  });
  svcList.addEventListener('mousedown', function (e) { e.preventDefault(); });
  document.addEventListener('click', function (e) {
    if (svcOpen && !e.target.closest('#svcList') && !e.target.closest('#svcTrigger')) setSvcOpen(false);
  });
  setService('');

  /* Валидация (те же правила, что в send.php) */
  function validate(d) {
    var err = {};
    var name = d.name.trim(), phone = d.phone.trim(), comment = d.comment.trim();
    if (name.length < 2) err.name = 'Укажите имя';
    else if (name.length > 60) err.name = 'Слишком длинное имя';
    if (phone.length > 25) err.phone = 'Проверьте номер';
    else if (phoneDigits(phone).length !== 9) err.phone = 'Введите номер полностью: +375 (29) 123-45-67';
    if (!d.service.trim()) err.service = 'Выберите услугу';
    if (comment.length > 1000) err.comment = 'Не более 1000 символов';
    return err;
  }
  function showErrors(err) {
    ['name', 'phone', 'service', 'comment'].forEach(function (k) {
      var span = $('[data-err=' + k + ']', form);
      span.hidden = !err[k];
      span.textContent = err[k] || '';
      var ctl = k === 'service' ? svcTrigger : form.elements[k];
      ctl.classList.toggle(FIELD_ERR, !!err[k]);
    });
  }

  var pending = false;
  var submitBtn = $('#submitBtn'), submitLabel = $('#submitLabel');
  function setPending(p) {
    pending = p;
    submitBtn.disabled = p;
    submitLabel.textContent = p ? 'Отправляем…' : 'Отправить заявку';
    var sp = $('[data-spin]', submitBtn);
    if (p && !sp) submitBtn.insertAdjacentHTML('afterbegin', icon('Loader2', 'lucide-loader-circle relative z-10 animate-spin').replace('<svg ', '<svg data-spin '));
    if (!p && sp) sp.remove();
  }
  function resetForm() {
    fName.value = ''; fPhone.value = PHONE_DEFAULT; fComment.value = ''; setService('');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (pending) return;
    var data = { name: fName.value, phone: fPhone.value, service: svcInput.value, comment: fComment.value, website: form.elements['website'].value };
    var err = validate(data);
    showErrors(err);
    if (Object.keys(err).length) return;
    setPending(true);
    fetch(form.getAttribute('action'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: data.name.trim(), phone: data.phone.trim(), service: data.service.trim(),
        comment: data.comment.trim(), website: data.website
      })
    }).then(function (r) { return r.json(); }).then(function (res) {
      if (!res || !res.ok) throw new Error('failed');
      toast('success', 'Заявка отправлена', 'Мы перезвоним вам в ближайшее время.');
      resetForm();
    }).catch(function () {
      toast('error', 'Не удалось отправить заявку', 'Позвоните нам: +375 (29) 557-78-89');
    }).then(function () { setPending(false); });
  });

  /* ---------- Нижняя панель на телефоне ---------- */
  var barEl = $('#mobileBar');
  var barDefault = barEl && $('[data-bar=default]', barEl);
  var barCalc = barEl && $('[data-bar=calc]', barEl);
  var barTotal = $('#barTotal');
  var pricesVisible = false;
  // Пока открыт раздел с калькулятором и выбрана хотя бы одна услуга — вместо «Позвонить / Записаться» показываем итог
  function updateBar(est) {
    if (!barEl) return;
    est = est || F.calcEstimate(state.selected, state.body, state.roofRack);
    var show = pricesVisible && est.items.length > 0;
    barDefault.hidden = show;
    barCalc.hidden = !show;
    if (show) barTotal.textContent = F.formatPrice(est.total, est.hasFrom);
  }
  if (barEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      pricesVisible = entries[0].isIntersecting;
      updateBar();
    }).observe($('#prices'));
  }

  /* ---------- Окно заявки (консультация · запись · запись с расчётом) ---------- */
  var L_CONSULT = 'Нужна консультация';
  var L_CALC_SERVICE = 'Запись по расчёту калькулятора';
  var MODES = {
    consult: {
      title: 'Получить консультацию',
      lead: 'Выберите услугу и оставьте контакты — перезвоним, ответим на вопросы и подберём удобное время.',
      submit: 'Получить консультацию', service: true
    },
    booking: {
      title: 'Записаться',
      lead: 'Оставьте контакты — свяжемся, согласуем время визита и подтвердим стоимость.',
      submit: 'Записаться', service: true
    },
    calc: {
      title: 'Записаться с расчётом',
      lead: 'Мы свяжемся, согласуем время визита и подтвердим итоговую стоимость.',
      submit: 'Отправить заявку', service: false
    }
  };

  var leadModal = $('#leadModal'), leadOverlay = $('#leadOverlay'), leadPanel = $('#leadPanel');
  var leadForm = $('#leadForm'), leadDone = $('#leadDone'), leadErrorBox = $('#leadError');
  var leadSel = $('#leadService'), leadSubmit = $('#leadSubmit');
  var lead = { mode: 'consult', source: '', open: false, calc: null, pending: false, lastFocus: null, timer: null };
  var LF = leadForm.elements;

  // список услуг для выбора: из того же прайса, что и калькулятор
  leadSel.innerHTML = '<option value="' + esc(L_CONSULT) + '">Не знаю — нужна консультация</option>' +
    F.CATEGORIES.map(function (c) {
      return '<optgroup label="' + esc(c.title) + '">' + c.services.map(function (s) {
        return '<option value="' + esc(c.title + ' — ' + s.name) + '">' + esc(s.name) + '</option>';
      }).join('') + '</optgroup>';
    }).join('');

  bindPhone(LF['phone']);

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function calcText() {
    var est = lead.calc.est;
    var lines = ['Кузов: ' + lead.calc.body]
      .concat(est.items.map(function (i) { return '• ' + i.service.name + ' — ' + F.formatPrice(i.price, i.service.from); }));
    if (est.roofRackApplied) lines.push('• Багажник на крыше — +' + F.ROOF_RACK_SURCHARGE + ' руб');
    lines.push('Итого: ' + F.formatPrice(est.total, est.hasFrom));
    return lines.join('\n');
  }

  function renderLeadSummary() {
    var box = $('#leadSummary');
    if (!lead.calc) { box.hidden = true; return; }
    var est = lead.calc.est;
    $('#leadSummaryBody').textContent = 'Кузов: ' + lead.calc.body;
    var html = est.items.map(function (it) {
      return '<li class="flex items-start justify-between gap-3"><span>' + esc(it.service.name) + '</span>' +
        '<span class="shrink-0 font-display">' + F.formatPrice(it.price, it.service.from) + '</span></li>';
    }).join('');
    if (est.roofRackApplied) {
      html += '<li class="flex justify-between gap-3 text-muted-foreground"><span>Багажник на крыше</span><span class="font-display">+' + F.ROOF_RACK_SURCHARGE + ' руб</span></li>';
    }
    $('#leadSummaryList').innerHTML = html;
    $('#leadSummaryTotal').textContent = F.formatPrice(est.total, est.hasFrom);
    box.hidden = false;
  }

  function showLeadErrors(err) {
    ['name', 'phone', 'date', 'comment'].forEach(function (k) {
      var span = $('[data-lead-err=' + k + ']', leadForm);
      span.hidden = !err[k];
      span.textContent = err[k] || '';
      LF[k].style.borderColor = err[k] ? 'var(--primary)' : '';
      if (err[k]) LF[k].setAttribute('aria-invalid', 'true'); else LF[k].removeAttribute('aria-invalid');
    });
  }

  function openLead(mode, source) {
    if (mode === 'calc') {
      var est = F.calcEstimate(state.selected, state.body, state.roofRack);
      if (est.items.length) lead.calc = { est: est, body: F.BODY_TYPES[F.columnOf(state.body)].short };
      else { mode = 'consult'; lead.calc = null; }
    } else {
      lead.calc = null;
    }
    lead.mode = mode;
    lead.source = source || '';
    var cfg = MODES[mode];
    $('#leadTitle').textContent = cfg.title;
    $('#leadLead').textContent = cfg.lead;
    $('#leadSubmitLabel').textContent = cfg.submit;
    $('#leadServiceWrap').hidden = !cfg.service;
    renderLeadSummary();
    leadForm.hidden = false;
    leadDone.hidden = true;
    leadErrorBox.hidden = true;
    showLeadErrors({});
    LF['date'].min = today();
    if (lead.open) return;

    lead.lastFocus = document.activeElement;
    if (menuOpen) setMenu(false);
    clearTimeout(lead.timer);
    leadModal.hidden = false;
    leadOverlay.setAttribute('data-state', 'open');
    leadPanel.setAttribute('data-state', 'open');
    lockScroll(true);
    lead.open = true;
    // На телефоне не вызываем клавиатуру сразу — она закрыла бы половину формы
    var fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    setTimeout(function () { (fine ? LF['name'] : leadPanel).focus(); }, 60);
  }

  function closeLead() {
    if (!lead.open) return;
    lead.open = false;
    leadOverlay.setAttribute('data-state', 'closed');
    leadPanel.setAttribute('data-state', 'closed');
    lockScroll(false);
    lead.timer = setTimeout(function () { leadModal.hidden = true; }, 250);
    if (lead.lastFocus && lead.lastFocus.focus) lead.lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-lead]');
    if (t) {
      e.preventDefault();
      openLead(t.getAttribute('data-lead'), t.getAttribute('data-source'));
      return;
    }
    if (e.target.closest && e.target.closest('[data-lead-close]')) closeLead();
  });
  leadOverlay.addEventListener('click', closeLead);
  document.addEventListener('keydown', function (e) {
    if (!lead.open) return;
    if (e.key === 'Escape') { e.preventDefault(); closeLead(); return; }
    if (e.key === 'Tab') {
      var f = $$('a[href], button, input, select, textarea', leadPanel).filter(function (el) {
        return !el.disabled && el.tabIndex >= 0 && !el.closest('[hidden]');
      });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === leadPanel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // кнопки калькулятора (в блоке «Ваш расчёт» и на нижней панели)
  elBook.addEventListener('click', function () { openLead('calc', 'Калькулятор'); });
  var barBook = $('#barBook');
  if (barBook) barBook.addEventListener('click', function () { openLead('calc', 'Калькулятор — нижняя панель'); });

  function setLeadPending(p) {
    lead.pending = p;
    leadSubmit.disabled = p;
    $('#leadSubmitLabel').textContent = p ? 'Отправляем…' : MODES[lead.mode].submit;
  }

  leadForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (lead.pending) return;
    var data = {
      name: LF['name'].value.trim(),
      phone: LF['phone'].value.trim(),
      service: lead.mode === 'calc' ? L_CALC_SERVICE : (LF['service'].value || L_CONSULT),
      car: LF['car'].value.trim(),
      date: LF['date'].value,
      time: LF['time'].value,
      comment: LF['comment'].value.trim(),
      calc: lead.mode === 'calc' && lead.calc ? calcText() : '',
      source: lead.source,
      website: LF['website'].value
    };
    var err = {};
    if (data.name.length < 2) err.name = 'Укажите имя';
    if (phoneDigits(data.phone).length !== 9) err.phone = 'Введите номер полностью: +375 (29) 123-45-67';
    if (data.date && data.date < today()) err.date = 'Выберите сегодняшний день или позже';
    if (data.comment.length > 1000) err.comment = 'Не более 1000 символов';
    showLeadErrors(err);
    var bad = Object.keys(err)[0];
    if (bad) { LF[bad].focus(); return; }

    leadErrorBox.hidden = true;
    setLeadPending(true);
    fetch('send.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json(); }).then(function (res) {
      if (!res || !res.ok) throw new Error('failed');
      leadForm.hidden = true;
      leadDone.hidden = false;
      $('#leadDoneTitle').textContent = lead.mode === 'consult' ? 'Заявка на консультацию отправлена' : 'Заявка отправлена';
      LF['name'].value = ''; LF['car'].value = ''; LF['date'].value = ''; LF['time'].value = ''; LF['comment'].value = '';
      LF['phone'].value = '+375 '; leadSel.value = L_CONSULT;
      leadPanel.focus();
      document.dispatchEvent(new CustomEvent('formula:lead', { detail: { mode: lead.mode, source: lead.source } }));
    }).catch(function () {
      leadErrorBox.hidden = false;
      leadErrorBox.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }).then(function () { setLeadPending(false); });
  });

  updateBar();

})();
