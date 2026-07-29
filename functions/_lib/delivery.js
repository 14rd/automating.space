// Shared delivery helpers for the Stripe → R2 → Resend flow.
// Used by: api/stripe-webhook.js, api/download-link.js, dl/[slug].js
import CATALOG from './catalog.js';

export { CATALOG };

const enc = new TextEncoder();

// --- HMAC-SHA256 (hex) via Web Crypto ---
export async function hmacHex(secret, msg) {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// --- Stripe REST (no SDK; runs on the Workers runtime) ---
export async function stripeGet(path, secretKey) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  if (!res.ok) throw new Error(`Stripe ${path} -> ${res.status} ${await res.text()}`);
  return res.json();
}

// --- Signed, time-limited download tokens ---
export async function signDownload(slug, secret, ttlSeconds = 86400) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const token = await hmacHex(secret, `${slug}.${exp}`);
  return { exp, token };
}

export async function verifyDownload(slug, exp, token, secret) {
  if (!slug || !exp || !token) return false;
  if (Math.floor(Date.now() / 1000) > Number(exp)) return false;
  const expected = await hmacHex(secret, `${slug}.${exp}`);
  return timingSafeEqual(expected, token);
}

export function downloadUrl(origin, slug, exp, token) {
  return `${origin}/dl/${encodeURIComponent(slug)}?exp=${exp}&token=${token}`;
}

// --- Resend transactional email ---
export async function sendDownloadEmail({ to, slug, url, env, lang = 'hu' }) {
  const title = CATALOG[slug]?.[lang] || CATALOG[slug]?.hu || slug;
  const subject = lang === 'en' ? `Your download: ${title}` : `A letöltésed: ${title}`;
  const text = lang === 'en'
    ? `Thanks for your purchase!\n\nDownload "${title}" here (link valid for 24 hours):\n${url}\n\n— Automating`
    : `Köszönjük a vásárlást!\n\nItt töltöd le a(z) „${title}” csomagot (a link 24 óráig él):\n${url}\n\n— Automating`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.RESEND_FROM || 'Automating <hello@automating.hu>',
      to,
      subject,
      text,
    }),
  });
  if (!res.ok) throw new Error(`Resend -> ${res.status} ${await res.text()}`);
  return res.json();
}
