/* Generated into assets/chrome.js by tools/build-chrome.mjs — do not edit the
   generated file. Behaviour for the shared header and footer on every page
   except index.html, which keeps its own inline copy.

   The language control is the awkward part, because the pages do not all
   switch languages the same way, and pretending otherwise would give some
   pages a control that silently does nothing. So it adapts, in this order:

     1. the page has its own setLang()            -> call it        (case studies)
     2. the page has .lang-block sections         -> toggle them    (privacy, terms)
     3. the page declares a counterpart document  -> navigate       (blog, articles)
     4. none of the above                         -> hide the control

   In cases 2-4 the page's own body text is not translatable, so only the
   header and footer strings are swapped, from the dictionary below. */
(function () {
  'use strict';

  var T = /*__I18N__*/;
  var html = document.documentElement;

  /* ── which language is this page written in, and is there a counterpart? ── */
  var pageLang = (html.getAttribute('lang') || 'hu').toLowerCase().slice(0, 2);
  var altHref  = html.getAttribute('data-alt-lang-href');   // set by the builder
  var altLang  = pageLang === 'hu' ? 'en' : 'hu';

  var hasOwnSetLang = typeof window.setLang === 'function';
  var langBlocks    = document.querySelectorAll('.lang-block');
  var mode = hasOwnSetLang ? 'own'
           : langBlocks.length ? 'blocks'
           : altHref ? 'navigate'
           : 'none';

  /* ── chrome strings ── */
  function applyChromeLang(lang) {
    var dict = T[lang]; if (!dict) return;
    var scope = document.querySelectorAll('.nav-outer [data-i18n], footer [data-i18n]');
    for (var i = 0; i < scope.length; i++) {
      var k = scope[i].getAttribute('data-i18n');
      if (dict[k] !== undefined) scope[i].innerHTML = dict[k];
    }
    document.querySelectorAll('.nav-outer [data-en-href], footer [data-en-href]').forEach(function (a) {
      if (!a.dataset.huHref) a.dataset.huHref = a.getAttribute('href');
      a.setAttribute('href', lang === 'en' ? a.dataset.enHref : a.dataset.huHref);
    });
    html.setAttribute('lang', lang);
  }

  function markActive(lang) {
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      if (b.closest('.nav-outer') || b.closest('footer')) b.classList.toggle('is-active', b.dataset.lang === lang);
    });
  }

  function choose(lang) {
    if (mode === 'own') { window.setLang(lang); markActive(lang); return; }
    if (mode === 'navigate') {
      if (lang !== pageLang) { try { localStorage.setItem('lang', lang); } catch (e) {} location.href = altHref; }
      return;
    }
    if (mode === 'blocks') {
      langBlocks.forEach(function (b) { b.classList.toggle('active', b.dataset.lang === lang); });
      /* the page's own toggle would now be a second control for the same
         thing, so the header takes it over */
      document.querySelectorAll('.lang-toggle button').forEach(function (b) {
        b.classList.toggle('active', (b.dataset.lang || b.textContent.trim().slice(0, 2).toLowerCase()) === lang);
      });
    }
    applyChromeLang(lang);
    try { localStorage.setItem('lang', lang); } catch (e) {}
    markActive(lang);
  }

  if (mode === 'none') {
    document.querySelectorAll('.lang-wrap, .nav-lang-mob, .ft-langs').forEach(function (el) { el.remove(); });
  } else {
    document.querySelectorAll('.lang-dd-btn, .lang-mob-opt, .ft-lang').forEach(function (btn) {
      btn.addEventListener('click', function () { choose(btn.dataset.lang); });
    });
    var start = pageLang;
    if (mode !== 'navigate') { try { start = localStorage.getItem('lang') || pageLang; } catch (e) {} }
    if (mode !== 'own') applyChromeLang(start);
    if (mode === 'blocks') choose(start);
    markActive(start);
    /* the header now owns the language, so the in-page duplicate goes */
    if (mode === 'blocks') document.querySelectorAll('.lang-toggle').forEach(function (el) { el.remove(); });
  }

  /* the desktop dropdown is inert without JS on these pages, so wire the label */
  var langLabel = document.getElementById('langLabel');
  if (langLabel) langLabel.textContent = (html.getAttribute('lang') || 'hu').toUpperCase().slice(0, 2);
  var langBtn = document.getElementById('langBtn'), langDd = document.getElementById('langDd');
  if (langBtn && langDd) {
    langBtn.addEventListener('click', function (e) { e.stopPropagation(); langDd.classList.toggle('open'); });
    document.addEventListener('click', function () { langDd.classList.remove('open'); });
  }

  /* ── mobile menu: same padding-bottom trick as index.html ── */
  var navToggle = document.getElementById('navToggle');
  var navLinks  = document.getElementById('navLinks');
  var navEl     = navToggle && navToggle.closest('nav');
  if (navToggle && navLinks && navEl) {
    var setOpen = function (open) {
      if (open) {
        navEl.style.paddingBottom = '';
        navEl.style.setProperty('--navrow', navEl.clientHeight + 'px');
        navEl.style.paddingBottom = navLinks.scrollHeight + 'px';
      } else navEl.style.paddingBottom = '';
      navEl.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.addEventListener('click', function () { setOpen(!navEl.classList.contains('is-open')); });
    navLinks.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    addEventListener('resize', function () {
      if (innerWidth > 900 && navEl.classList.contains('is-open')) setOpen(false);
    });
  }

  /* ── nav CTA: only deferred where a hero owns the same button ── */
  var cta = document.getElementById('navCta');
  if (cta && navEl) {
    var heroCta = document.querySelector('.hero .btn-pill');
    var mq = matchMedia('(max-width: 900px)');
    var live = true;
    var sync = function () {
      navEl.classList.toggle('cta-live', live);
      var hidden = mq.matches && !live;
      cta.setAttribute('aria-hidden', hidden ? 'true' : 'false');
      cta.tabIndex = hidden ? -1 : 0;
    };
    var measure = function () {
      cta.style.maxWidth = 'none';
      var w = cta.getBoundingClientRect().width;
      cta.style.maxWidth = '';
      if (w) cta.style.setProperty('--cta-w', w.toFixed(2) + 'px');
    };
    measure();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    addEventListener('resize', measure);
    new MutationObserver(measure).observe(cta, { childList: true, subtree: true, characterData: true });
    if (heroCta) {
      live = false;
      var line = Math.round(navEl.getBoundingClientRect().bottom) + 8;
      new IntersectionObserver(function (en) { live = !en[0].isIntersecting; sync(); },
        { rootMargin: '-' + line + 'px 0px 0px 0px', threshold: 0 }).observe(heroCta);
    }
    sync();
    mq.addEventListener('change', sync);
  }
})();
