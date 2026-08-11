#!/usr/bin/env node
/**
 * build-chrome.mjs — one source of truth for the site header and footer.
 *
 * Every page used to carry its own hand-written <nav> and <footer>: five
 * different headers and four different footers, some with no mobile menu at
 * all. This lifts the canonical chrome out of index.html and writes it into
 * every other page, so a change to index.html propagates everywhere.
 *
 * What it does per page:
 *   1. replaces the markup between the CHROME markers (inserting the markers
 *      around the existing <nav>/<footer> on first run),
 *   2. strips the page's own nav/footer CSS rules out of its inline <style>
 *      and links assets/chrome.css instead,
 *   3. links assets/chrome.js for the burger, the language control and the
 *      scroll-revealed nav CTA.
 *
 * index.html is the source, not a target: it keeps its chrome inline.
 *
 *   node tools/build-chrome.mjs           # write
 *   node tools/build-chrome.mjs --check   # report what would change
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const CHECK = process.argv.includes('--check');
const read  = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

/* Which selectors belong to the chrome. Anything matching moves to chrome.css
   and is deleted from the pages' own inline styles, so this list has to be
   exact rather than prefix-ish. A blanket .lang- once swallowed the pages' own
   .lang-block / .lang-toggle rules, which are how privacy.html and terms.html
   show one language at a time - both versions then rendered at once. */
const CHROME_SELECTOR = new RegExp('(^|[\\s,>+~])(' + [
  'nav\\b', 'footer\\b',
  '\\.nav-', '\\.ft-', '\\.footer-', '\\.btn-pill', '\\.menuOpen',
  '\\.lang-wrap', '\\.lang-btn', '\\.lang-globe', '\\.lang-chevron',
  '\\.lang-dd', '\\.lang-mob-',
].join('|') + ')');
const CHROME_ATRULE   = /@keyframes\s+menuOpen/;

/* ── a very small CSS splitter: good enough for a hand-written stylesheet ── */
function splitRules(css) {
  const out = []; let i = 0, depth = 0, start = 0;
  while (i < css.length) {
    const c = css[i];
    if (c === '/' && css[i+1] === '*') { const e = css.indexOf('*/', i); i = e < 0 ? css.length : e + 2; continue; }
    if (c === '{') { depth++; }
    else if (c === '}') { depth--; if (depth === 0) { out.push(css.slice(start, i + 1)); start = i + 1; } }
    i++;
  }
  if (css.slice(start).trim()) out.push(css.slice(start));
  return out;
}
/* The chunk handed back by splitRules still carries any comment that sat above
   the rule, and a comment that happens to mention "footer" would otherwise get
   the rule classified as chrome and moved out of the page. Only the selector
   itself may decide. */
const prelude = rule => rule.slice(0, rule.indexOf('{')).replace(/\/\*[\s\S]*?\*\//g, '');
const isChrome = rule => {
  const head = prelude(rule);
  if (CHROME_ATRULE.test(head)) return true;
  if (/^\s*@media/.test(head)) return false;         // handled by the caller
  return CHROME_SELECTOR.test(head);
};

/* Pull the chrome rules out of a stylesheet, descending into @media blocks. */
function partition(css) {
  const chrome = [], rest = [];
  for (const rule of splitRules(css)) {
    const head = prelude(rule);
    if (/^\s*@media/.test(head)) {
      const open = rule.indexOf('{'), body = rule.slice(open + 1, rule.lastIndexOf('}'));
      const inner = partition(body);
      if (inner.chrome.trim()) chrome.push(`${head.trim()} {\n${inner.chrome}\n}`);
      if (inner.rest.trim())   rest.push(`${head.trim()} {\n${inner.rest}\n}`);
    } else if (isChrome(rule)) chrome.push(rule.trim());
    else rest.push(rule.trim());
  }
  return { chrome: chrome.join('\n'), rest: rest.join('\n') };
}

const styleOf = html => {
  const m = html.match(/<style>([\s\S]*?)<\/style>/);
  return m ? { css: m[1], full: m[0] } : null;
};

/* ── canonical chrome, taken from index.html ── */
const index = read('index.html');

const navMarkup = index.match(/[ \t]*<!-- NAV -->\n([\s\S]*?<\/nav>\n\s*<\/div>)/);
const ftMarkup  = index.match(/[ \t]*<!-- FOOTER -->\n([\s\S]*?<\/footer>)/);
if (!navMarkup || !ftMarkup) { console.error('could not find the nav/footer markup in index.html'); process.exit(1); }

const CANON = {
  nav:    navMarkup[1].replace(/^ {2}/gm, ''),
  footer: ftMarkup[1].replace(/^ {2}/gm, ''),
  css:    partition(styleOf(index).css).chrome,
};

/* ── the chrome's own strings, lifted out of index.html's dictionaries so the
   header and footer read correctly on pages that cannot translate themselves ── */
function dictOf(lang) {
  const block = index.match(new RegExp(`\\b${lang}:\\s*\\{([\\s\\S]*?)\\n  \\}`));
  if (!block) { console.error(`no ${lang} dictionary in index.html`); process.exit(1); }
  const out = {};
  const re = /'([^']+)':\s*'((?:[^'\\]|\\.)*)'/g;
  let m; while ((m = re.exec(block[1]))) {
    if (/^(nav|footer|cta)\./.test(m[1])) out[m[1]] = m[2].replace(/\\'/g, "'");
  }
  return out;
}
const I18N = { hu: dictOf('hu'), en: dictOf('en') };

/* Which HU page corresponds to which EN page. Taken from the article links in
   index.html, which already carry both. */
const PAIRS = {};
for (const m of index.matchAll(/href="([^"]+)"\s+data-en-href="([^"]+)"/g)) {
  PAIRS[m[1]] = m[2]; PAIRS[m[2]] = m[1];
}
PAIRS['blog.html'] = 'blog-en.html'; PAIRS['blog-en.html'] = 'blog.html';

const jsOut = read('tools/chrome.template.js').replace('/*__I18N__*/', JSON.stringify(I18N, null, 2));
const jsPath = path.join(ROOT, 'assets/chrome.js');
const jsPrev = fs.existsSync(jsPath) ? fs.readFileSync(jsPath, 'utf8') : '';
if (jsOut !== jsPrev && !CHECK) fs.writeFileSync(jsPath, jsOut);

/* Pages that get the chrome. index.html is the source; store.html and termek/
   are the shop's build inputs and are excluded from Pages by _config.yml. */
const PAGES = [
  'blog.html', 'blog-en.html', 'case-studies.html', 'koszonjuk.html',
  'privacy.html', 'terms.html', 'impresszum.html', '404.html',
  ...fs.readdirSync(path.join(ROOT, 'blog')).filter(f => f.endsWith('.html')).map(f => `blog/${f}`),
];

/* Two rewrites are needed away from index.html.
   Bare anchors like #products point at sections that only exist on the home
   page, so on every other page they have to address it explicitly - otherwise
   the header links quietly scroll the current page to nowhere.
   And the blog articles live one level down, so their chrome needs ../. */
function rebase(html, depth) {
  const up = '../'.repeat(depth);
  /* one pass, so a value is never prefixed twice */
  return html.replace(/(href|src|data-en-href)="([^"]*)"/g, (m, attr, val) => {
    if (/^(https?:|mailto:|tel:|\/|data:)/.test(val)) return m;   // absolute, leave alone
    if (val.startsWith('#')) return `${attr}="${up}index.html${val}"`;
    return `${attr}="${up}${val}"`;
  });
}

const MARK = {
  navStart: '<!-- CHROME:HEADER — generated by tools/build-chrome.mjs, edit index.html instead -->',
  navEnd:   '<!-- /CHROME:HEADER -->',
  ftStart:  '<!-- CHROME:FOOTER — generated by tools/build-chrome.mjs, edit index.html instead -->',
  ftEnd:    '<!-- /CHROME:FOOTER -->',
};

let changed = 0;
const report = [];

for (const page of PAGES) {
  const depth = page.split('/').length - 1;
  const file = path.join(ROOT, page);
  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  const notes = [];

  /* ── 0. declare the counterpart document, so the language control knows
        whether it can navigate to a translation ── */
  const alt = PAIRS[page];
  html = alt
    ? (html.includes('data-alt-lang-href')
        ? html.replace(/ data-alt-lang-href="[^"]*"/, ` data-alt-lang-href="${'../'.repeat(depth)}${alt}"`)
        : html.replace(/<html([^>]*)>/, `<html$1 data-alt-lang-href="${'../'.repeat(depth)}${alt.replace(/^blog\//, depth ? '' : 'blog/')}">`))
    : html;

  /* ── 1. markup ── */
  const nav = rebase(CANON.nav, depth);
  const foot = rebase(CANON.footer, depth);

  if (html.includes(MARK.navStart)) {
    html = html.replace(new RegExp(`${MARK.navStart}[\\s\\S]*?${MARK.navEnd}`), `${MARK.navStart}\n${nav}\n${MARK.navEnd}`);
  } else if (/<div class="nav-outer">[\s\S]*?<\/nav>\s*<\/div>/.test(html)) {
    html = html.replace(/(?:[ \t]*<!-- NAV -->\n)?[ \t]*<div class="nav-outer">[\s\S]*?<\/nav>\s*<\/div>/,
      `${MARK.navStart}\n${nav}\n${MARK.navEnd}`);
    notes.push('header replaced');
  } else {
    /* pages with no header at all (koszonjuk, 404): put it first inside <body> */
    html = html.replace(/(<body[^>]*>\n?)/, `$1${MARK.navStart}\n${nav}\n${MARK.navEnd}\n`);
    notes.push('header added');
  }

  if (html.includes(MARK.ftStart)) {
    html = html.replace(new RegExp(`${MARK.ftStart}[\\s\\S]*?${MARK.ftEnd}`), `${MARK.ftStart}\n${foot}\n${MARK.ftEnd}`);
  } else if (/<footer[\s\S]*?<\/footer>/.test(html)) {
    html = html.replace(/(?:[ \t]*<!-- FOOTER -->\n)?[ \t]*<footer[\s\S]*?<\/footer>/,
      `${MARK.ftStart}\n${foot}\n${MARK.ftEnd}`);
    notes.push('footer replaced');
  } else {
    html = html.replace(/(\n?<\/body>)/, `\n${MARK.ftStart}\n${foot}\n${MARK.ftEnd}\n$1`);
    notes.push('footer added');
  }

  /* ── 2. the page's own chrome CSS goes away in favour of chrome.css ── */
  const st = styleOf(html);
  if (st) {
    const { rest } = partition(st.css);
    if (rest.trim().length !== st.css.trim().length) notes.push('inline chrome css stripped');
    html = html.replace(st.full, `<style>\n${rest}\n</style>`);
  }
  const cssHref = `${'../'.repeat(depth)}assets/chrome.css`;
  const jsSrc   = `${'../'.repeat(depth)}assets/chrome.js`;
  if (!html.includes(cssHref)) {
    html = html.replace(/(<style>)/, `<link rel="stylesheet" href="${cssHref}">\n$1`);
    notes.push('chrome.css linked');
  }
  if (!html.includes(jsSrc)) {
    html = html.replace(/(\n?<\/body>)/, `\n<script src="${jsSrc}" defer></script>$1`);
    notes.push('chrome.js linked');
  }

  if (html !== before) { changed++; if (!CHECK) fs.writeFileSync(file, html); }
  report.push(`${page.padEnd(44)} ${notes.length ? notes.join(', ') : 'up to date'}`);
}

/* ── 3. the shared stylesheet ── */
/* The chrome cannot assume the host page resets anything: 404.html and
   koszonjuk.html, for instance, have no global a { text-decoration: none },
   which left the header links underlined. These few rules are scoped to the
   chrome so they give it the same ground index.html stands on without
   reaching into the page's own styles. */
const BASE = `.nav-outer, .nav-outer *, footer, footer * { box-sizing: border-box; }
/* :where() so these carry no specificity of their own - a plain
   .nav-outer a rule would outrank .btn-pill and paint the call-to-action's
   label black on its black pill. */
.nav-outer :where(a), footer :where(a) { color: inherit; text-decoration: none; }
.nav-outer :where(ul), footer :where(ul) { list-style: none; margin: 0; padding: 0; }
.nav-outer, footer { font-family: 'Inter', system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
.nav-outer button, footer button { font-family: inherit; }
:root { --black: #0a0a0a; --white: #ffffff; --g200: #e8e8e8; --g400: #a0a0a0; --g600: #666666; }`;

const cssOut = `/* Generated by tools/build-chrome.mjs from index.html — do not edit.\n`
  + `   index.html keeps this same CSS inline; change it there and re-run. */\n`
  + `${BASE}\n\n${CANON.css}\n`;
const cssPath = path.join(ROOT, 'assets/chrome.css');
const cssPrev = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';
if (cssOut !== cssPrev && !CHECK) fs.writeFileSync(cssPath, cssOut);

console.log(report.join('\n'));
console.log(`\n${CHECK ? 'would change' : 'changed'}: ${changed}/${PAGES.length} pages`);
console.log(`assets/chrome.css: ${(cssOut.length / 1024).toFixed(1)} kB${cssOut === cssPrev ? ' (unchanged)' : ''}`);
console.log(`assets/chrome.js:  ${(jsOut.length / 1024).toFixed(1)} kB, ${Object.keys(I18N.hu).length} chrome strings`);
