// Stripe webhook: on a paid checkout, email the buyer a signed download link.
// Configure in Stripe Dashboard → Developers → Webhooks:
//   endpoint: https://store.automating.hu/api/stripe-webhook
//   event:    checkout.session.completed
// Env required: STRIPE_WEBHOOK_SECRET, DOWNLOAD_SECRET, RESEND_API_KEY
import { hmacHex, signDownload, downloadUrl, sendDownloadEmail } from '../_lib/delivery.js';

const TOLERANCE_SECONDS = 300; // reject replays older than 5 min

async function verifyStripeSignature(rawBody, header, secret) {
  if (!header) return false;
  const parts = {};
  for (const kv of header.split(',')) {
    const i = kv.indexOf('=');
    if (i > 0) (parts[kv.slice(0, i)] ||= []).push(kv.slice(i + 1));
  }
  const t = parts.t?.[0];
  const sigs = parts.v1 || [];
  if (!t || !sigs.length) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - Number(t)) > TOLERANCE_SECONDS) return false;
  const expected = await hmacHex(secret, `${t}.${rawBody}`);
  return sigs.some(s => s === expected);
}

export async function onRequestPost({ request, env }) {
  const raw = await request.text();
  const ok = await verifyStripeSignature(
    raw, request.headers.get('stripe-signature'), env.STRIPE_WEBHOOK_SECRET);
  if (!ok) return new Response('invalid signature', { status: 400 });

  const event = JSON.parse(raw);
  if (event.type !== 'checkout.session.completed') {
    return new Response('ignored', { status: 200 });
  }

  const session = event.data.object;
  if (session.payment_status !== 'paid') return new Response('unpaid', { status: 200 });

  const slug = session.metadata?.slug;
  const email = session.customer_details?.email;
  const lang = session.metadata?.lang === 'en' ? 'en' : 'hu';
  if (!slug || !email) return new Response('missing slug/email', { status: 200 });

  const origin = new URL(request.url).origin;
  const { exp, token } = await signDownload(slug, env.DOWNLOAD_SECRET);
  const url = downloadUrl(origin, slug, exp, token);

  await sendDownloadEmail({ to: email, slug, url, env, lang });
  return new Response('ok', { status: 200 });
}
