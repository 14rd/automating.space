/* Cookie consent + tracking, shared by every public page.
   Loaded from the <head> of each page with `defer`; there is no build step
   behind this file, it is the source.

   The one rule the whole file exists to keep: until the visitor has decided,
   nothing is requested from googletagmanager.com, google-analytics.com,
   clarity.ms, connect.facebook.net or facebook.com. So no vendor snippet is
   inlined and no <link rel=preconnect> is emitted here — every tag is injected
   only from inside its loader, and the loaders are only reached from a stored
   or freshly given consent.

   Consent Mode v2 defaults are pushed into dataLayer straight away, which is a
   plain array push and costs no request. gtag.js, when it eventually loads,
   replays the queue and so sees "denied" before anything else.

   State lives in localStorage under automating_consent_v1:
       { "v":1, "analytics":false, "marketing":false, "ts":"…" }
   Absent or a different "v" means undecided, and the banner shows.

   window.AutomatingConsent is the page-facing API:
       .open()          open the settings dialog (footer link, privacy page)
       .get()           { analytics, marketing } or null while undecided
       .trackBooking(id) the one conversion — see index.html's booking modal */
(function () {
  'use strict';

  var KEY        = 'automating_consent_v1';
  var VERSION    = 1;
  var GA_ID      = 'G-3E2J27C0D8';
  var CLARITY_ID = 'y0rvi5rvjp';
  var PIXEL_ID   = '1308604051436451';

  /* ════════════════════════════════════════════════════════════════════
     STORED DECISION
  ════════════════════════════════════════════════════════════════════ */
  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (!o || o.v !== VERSION) return null;       // a future v2 re-asks
      return { analytics: !!o.analytics, marketing: !!o.marketing };
    } catch (e) { return null; }
  }

  function write(analytics, marketing) {
    var o = { v: VERSION, analytics: !!analytics, marketing: !!marketing, ts: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {}
    return { analytics: o.analytics, marketing: o.marketing };
  }

  var state  = read();                               // null while undecided
  var loaded = { ga: false, clarity: false, meta: false };

  /* ════════════════════════════════════════════════════════════════════
     GOOGLE CONSENT MODE v2
  ════════════════════════════════════════════════════════════════════ */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',   // language choice, consent record
    security_storage: 'granted',
    wait_for_update: 500
  });

  function pushConsent(s) {
    gtag('consent', 'update', {
      analytics_storage:  s.analytics ? 'granted' : 'denied',
      ad_storage:         s.marketing ? 'granted' : 'denied',
      ad_user_data:       s.marketing ? 'granted' : 'denied',
      ad_personalization: s.marketing ? 'granted' : 'denied'
    });
  }

  /* ════════════════════════════════════════════════════════════════════
     VENDOR LOADERS — each reached only with the matching consent
  ════════════════════════════════════════════════════════════════════ */

  /* Google Analytics 4 — analytics consent only. Marketing alone must not
     pull gtag.js in, so ad_storage may sit granted in the queue with no tag
     to consume it; that is correct, and it is applied the moment analytics
     is granted too. */
  function loadGA() {
    if (loaded.ga) return;
    loaded.ga = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    (document.head || document.documentElement).appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  /* Microsoft Clarity — analytics consent only. The ConsentV2 signal is sent
     right after the tag, before it can bank any recording, and its field
     names are the API's own casing: ad_Storage / analytics_Storage. */
  function loadClarity() {
    if (loaded.clarity) return;
    loaded.clarity = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
    clarityConsent(true, !!(state && state.marketing));
  }

  function clarityConsent(analyticsGranted, marketingGranted) {
    if (typeof window.clarity !== 'function') return;
    try {
      window.clarity('consent', 'v2', {
        ad_Storage:        marketingGranted ? 'granted' : 'denied',
        analytics_Storage: analyticsGranted ? 'granted' : 'denied'
      });
    } catch (e) {}
  }

  /* Clarity keeps its user/session ids in first-party cookies and mirrors
     some of it into storage. On withdrawal the denied signal alone leaves
     those behind, so they go too — then the page reloads with nothing to
     resume from. Cross-domain cookies (clarity.ms, bing.com) are not ours
     to delete; the denied signal is what stops those. */
  function clearClarityStorage() {
    var host = location.hostname;
    var parts = host.split('.');
    var domains = [null, host];
    for (var i = 0; i < parts.length - 1; i++) domains.push('.' + parts.slice(i).join('.'));
    ['_clck', '_clsk', 'CLID'].forEach(function (name) {
      domains.forEach(function (d) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/' + (d ? '; domain=' + d : '');
      });
    });
    [localStorage, sessionStorage].forEach(function (store) {
      try {
        Object.keys(store).forEach(function (k) {
          if (/^_cl/.test(k) || /clarity/i.test(k)) store.removeItem(k);
        });
      } catch (e) {}
    });
  }

  /* Meta Pixel — marketing consent only. No <noscript> counterpart anywhere
     on the site: that image would fire a PageView for every visitor with
     JavaScript off, consent or not. */
  function loadMeta() {
    if (loaded.meta) return;
    loaded.meta = true;
    /* eslint-disable */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('consent', 'grant');
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  /* ════════════════════════════════════════════════════════════════════
     APPLY / SAVE
  ════════════════════════════════════════════════════════════════════ */
  function apply() {
    if (!state) return;
    pushConsent(state);
    if (state.analytics) { loadGA(); loadClarity(); }
    if (state.marketing) loadMeta();
    /* marketing granted later, while Clarity is already running */
    if (loaded.clarity) clarityConsent(state.analytics, state.marketing);
  }

  /* A tag that is already in the page cannot be un-run, so withdrawal tells
     each vendor to stop, wipes what is wipeable and reloads into a clean
     document. Granting needs no reload — the loaders handle it in place. */
  function save(analytics, marketing) {
    var wasAnalytics = !!(state && state.analytics);
    var wasMarketing = !!(state && state.marketing);
    state = write(analytics, marketing);
    pushConsent(state);

    var reload = false;
    if (wasAnalytics && !analytics) {
      clarityConsent(false, false);
      clearClarityStorage();
      reload = true;                                  // GA4 stops on reload
    }
    if (wasMarketing && !marketing) {
      if (typeof window.fbq === 'function') { try { window.fbq('consent', 'revoke'); } catch (e) {} }
      reload = true;
    }

    closeModal();
    hideBanner();
    if (reload) { location.reload(); return; }
    apply();
  }

  /* ════════════════════════════════════════════════════════════════════
     CONVERSION
     Called from exactly one place: index.html, after the Cal.com /bookings
     response has come back with status "success". Never from a CTA click or
     from opening the modal, and never with a field the visitor typed.
  ════════════════════════════════════════════════════════════════════ */
  var firedBookings = {};

  function trackBooking(bookingId) {
    if (bookingId) {
      if (firedBookings[bookingId]) return;
      firedBookings[bookingId] = true;
    }
    if (state && state.analytics) {
      if (loaded.ga) gtag('event', 'generate_lead', { method: 'cal.com_booking' });
      if (typeof window.clarity === 'function') {
        try { window.clarity('event', 'booking_completed'); } catch (e) {}
      }
    }
    if (state && state.marketing && typeof window.fbq === 'function') {
      try { window.fbq('track', 'Lead'); } catch (e) {}
    }
  }

  /* ════════════════════════════════════════════════════════════════════
     COPY
  ════════════════════════════════════════════════════════════════════ */
  var T = {
    hu: {
      title:      'Sütiket használunk',
      body:       'A működéshez szükséges tárolást mindig használjuk. Analitikai és marketing­sütiket csak akkor, ha hozzájárulsz. Részletek az <a href="{privacy}">Adatvédelmi nyilatkozatban</a>.',
      acceptAll:  'Mindent elfogadok',
      rejectAll:  'Mindent elutasítok',
      settings:   'Beállítások',
      panelTitle: 'Sütibeállítások',
      panelIntro: 'Kategóriánként eldöntheted, mit engedélyezel. A döntésed a böngésződben tárolódik, és bármikor módosítható a lábléc „Sütibeállítások” hivatkozásával.',
      close:      'Bezárás',
      save:       'Kiválasztottak mentése',
      always:     'Mindig aktív',
      necessary:  'Szükséges',
      necessaryD: 'A weboldal alapvető működéséhez tartozó tárolás: a választott nyelv, a demók munkamenete és maga a sütibeállítás. Nem kapcsolható ki, és nem használjuk mérésre.',
      analytics:  'Analitika',
      analyticsD: 'Segít megérteni, hogyan használják a látogatók az oldalt: mely oldalak érdekesek, hol akadnak el. A Clarity ehhez képernyőfelvételt és hőtérképet is készít.',
      marketing:  'Marketing',
      marketingD: 'A hirdetéseink eredményének mérése és remarketing-közönségek képzése.',
      vGa:        'Google Analytics 4 — látogatottsági statisztika',
      vClarity:   'Microsoft Clarity — hőtérkép és munkamenet-felvétel',
      vMeta:      'Meta Pixel — konverziómérés és remarketing'
    },
    en: {
      title:      'We use cookies',
      body:       'Storage needed to run the site is always on. Analytics and marketing cookies only with your consent. Details in the <a href="{privacy}">Privacy Notice</a>.',
      acceptAll:  'Accept all',
      rejectAll:  'Reject all',
      settings:   'Settings',
      panelTitle: 'Cookie settings',
      panelIntro: 'Choose what you allow, category by category. Your choice is stored in your browser and can be changed any time from the “Cookie settings” link in the footer.',
      close:      'Close',
      save:       'Save choices',
      always:     'Always on',
      necessary:  'Necessary',
      necessaryD: 'Storage the site needs to work at all: the chosen language, the demo sessions and this cookie setting itself. It cannot be turned off and is never used for measurement.',
      analytics:  'Analytics',
      analyticsD: 'Helps us understand how visitors use the site: which pages hold attention, where people get stuck. Clarity also records sessions and builds heatmaps for this.',
      marketing:  'Marketing',
      marketingD: 'Measuring how our ads perform and building remarketing audiences.',
      vGa:        'Google Analytics 4 — traffic statistics',
      vClarity:   'Microsoft Clarity — heatmaps and session recording',
      vMeta:      'Meta Pixel — conversion tracking and remarketing'
    }
  };

  /* index.html and chrome.js both write the live language onto <html lang>,
     which makes it the one signal worth reading on every page. */
  function lang() {
    var l = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    if (l.indexOf('en') === 0) return 'en';
    if (l.indexOf('hu') === 0) return 'hu';
    try { var s = localStorage.getItem('lang'); if (s === 'en' || s === 'hu') return s; } catch (e) {}
    return 'hu';
  }

  /* the blog articles sit one directory down */
  function privacyHref() {
    var depth = location.pathname.replace(/^\/|\/$/g, '').split('/').length - 1;
    return (depth > 0 ? '../'.repeat(depth) : '') + 'privacy.html';
  }

  function t(key) {
    var s = (T[lang()] || T.hu)[key] || '';
    return s.replace('{privacy}', privacyHref());
  }

  /* ════════════════════════════════════════════════════════════════════
     UI
  ════════════════════════════════════════════════════════════════════ */
  var bannerEl = null, modalEl = null, lastFocus = null;

  function el(html) {
    var d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstElementChild;
  }

  /* index.html hijacks the wheel to drive its scroll animation, which would
     scroll the page behind an open dialog */
  function stopWheel(node) { node.addEventListener('wheel', function (e) { e.stopPropagation(); }); }

  function showBanner() {
    if (bannerEl) return;
    bannerEl = el(
      '<div class="ac-banner" role="region" aria-label="' + esc(t('panelTitle')) + '">' +
        '<h2 class="ac-banner-title"></h2>' +
        '<p class="ac-banner-body"></p>' +
        '<div class="ac-actions">' +
          '<button type="button" class="ac-btn ac-btn-primary" data-ac="all"></button>' +
          '<button type="button" class="ac-btn ac-btn-secondary" data-ac="none"></button>' +
          '<button type="button" class="ac-btn ac-btn-quiet" data-ac="settings"></button>' +
        '</div>' +
      '</div>');
    stopWheel(bannerEl);
    bannerEl.querySelector('[data-ac="all"]').addEventListener('click', function () { save(true, true); });
    bannerEl.querySelector('[data-ac="none"]').addEventListener('click', function () { save(false, false); });
    bannerEl.querySelector('[data-ac="settings"]').addEventListener('click', function () { openModal(); });
    document.body.appendChild(bannerEl);
    paintBanner();
  }

  function paintBanner() {
    if (!bannerEl) return;
    bannerEl.querySelector('.ac-banner-title').textContent = t('title');
    bannerEl.querySelector('.ac-banner-body').innerHTML = t('body');
    bannerEl.querySelector('[data-ac="all"]').textContent = t('acceptAll');
    bannerEl.querySelector('[data-ac="none"]').textContent = t('rejectAll');
    bannerEl.querySelector('[data-ac="settings"]').textContent = t('settings');
  }

  function hideBanner() {
    if (bannerEl && bannerEl.parentNode) bannerEl.parentNode.removeChild(bannerEl);
    bannerEl = null;
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function category(id, locked) {
    return '<section class="ac-cat" data-cat="' + id + '">' +
             '<div class="ac-cat-head">' +
               '<h3 class="ac-cat-name"></h3>' +
               (locked
                 ? '<span class="ac-locked"></span>'
                 : '<label class="ac-switch"><input type="checkbox" data-toggle="' + id + '"><span></span></label>') +
             '</div>' +
             '<p class="ac-cat-desc"></p>' +
             '<ul class="ac-vendors"></ul>' +
           '</section>';
  }

  function openModal() {
    if (modalEl) return;
    lastFocus = document.activeElement;
    modalEl = el(
      '<div class="ac-modal" role="dialog" aria-modal="true" aria-label="' + esc(t('panelTitle')) + '">' +
        '<div class="ac-panel">' +
          '<div class="ac-panel-head">' +
            '<h2 class="ac-panel-title"></h2>' +
            '<button type="button" class="ac-close" data-ac="close" aria-label="">&times;</button>' +
          '</div>' +
          '<div class="ac-panel-body">' +
            '<p class="ac-intro"></p>' +
            category('necessary', true) +
            category('analytics', false) +
            category('marketing', false) +
          '</div>' +
          '<div class="ac-panel-foot">' +
            '<button type="button" class="ac-btn ac-btn-quiet" data-ac="none"></button>' +
            '<span class="ac-spacer"></span>' +
            '<div class="ac-foot-actions">' +
              '<button type="button" class="ac-btn ac-btn-secondary" data-ac="save"></button>' +
              '<button type="button" class="ac-btn ac-btn-primary" data-ac="all"></button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>');
    stopWheel(modalEl);

    var on = function (sel, fn) { modalEl.querySelector(sel).addEventListener('click', fn); };
    on('[data-ac="close"]', closeModal);
    on('[data-ac="none"]', function () { save(false, false); });
    on('[data-ac="all"]',  function () { save(true, true); });
    on('[data-ac="save"]', function () {
      save(modalEl.querySelector('[data-toggle="analytics"]').checked,
           modalEl.querySelector('[data-toggle="marketing"]').checked);
    });
    modalEl.addEventListener('click', function (e) { if (e.target === modalEl) closeModal(); });

    document.body.appendChild(modalEl);
    paintModal();
    modalEl.querySelector('[data-toggle="analytics"]').checked = !!(state && state.analytics);
    modalEl.querySelector('[data-toggle="marketing"]').checked = !!(state && state.marketing);
    modalEl.querySelector('.ac-close').focus();
  }

  function paintModal() {
    if (!modalEl) return;
    var q = function (s) { return modalEl.querySelector(s); };
    q('.ac-panel-title').textContent = t('panelTitle');
    q('.ac-intro').innerHTML = t('panelIntro');
    q('.ac-close').setAttribute('aria-label', t('close'));
    q('[data-ac="none"]').textContent = t('rejectAll');
    q('[data-ac="save"]').textContent = t('save');
    q('[data-ac="all"]').textContent  = t('acceptAll');

    var fill = function (id, name, desc, vendors) {
      var c = q('[data-cat="' + id + '"]');
      c.querySelector('.ac-cat-name').textContent = t(name);
      c.querySelector('.ac-cat-desc').textContent = t(desc);
      c.querySelector('.ac-vendors').innerHTML =
        vendors.map(function (v) { return '<li>' + esc(t(v)) + '</li>'; }).join('');
    };
    q('[data-cat="necessary"] .ac-locked').textContent = t('always');
    fill('necessary', 'necessary', 'necessaryD', []);
    fill('analytics', 'analytics', 'analyticsD', ['vGa', 'vClarity']);
    fill('marketing', 'marketing', 'marketingD', ['vMeta']);
  }

  function closeModal() {
    if (!modalEl) return;
    if (modalEl.parentNode) modalEl.parentNode.removeChild(modalEl);
    modalEl = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    lastFocus = null;
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalEl) closeModal();
  });

  /* the language control rewrites <html lang>, so the dialog follows it */
  new MutationObserver(function () { paintBanner(); paintModal(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  /* re-entry points: the footer link, and anything else that opts in */
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest && e.target.closest('[data-cookie-settings], a[href="#cookie-settings"]');
    if (trigger) { e.preventDefault(); openModal(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var trigger = e.target.closest && e.target.closest('[data-cookie-settings]');
    if (trigger) { e.preventDefault(); openModal(); }
  });

  /* ════════════════════════════════════════════════════════════════════
     BOOT
  ════════════════════════════════════════════════════════════════════ */
  window.AutomatingConsent = {
    open: openModal,
    get: function () { return state ? { analytics: state.analytics, marketing: state.marketing } : null; },
    acceptAll: function () { save(true, true); },
    rejectAll: function () { save(false, false); },
    set: save,
    trackBooking: trackBooking
  };

  function boot() {
    if (state) apply(); else showBanner();
    if (/(^|[?&])cookie-settings(=|&|$)/.test(location.search) || location.hash === '#cookie-settings') openModal();
  }

  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();
