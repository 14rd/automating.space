// Thank-you page calls this with the Stripe Checkout session_id from the
// post-payment redirect. We verify payment server-side, then hand back a
// signed, time-limited download URL.
// Env required: STRIPE_SECRET_KEY, DOWNLOAD_SECRET
import { stripeGet, signDownload, downloadUrl, CATALOG } from '../_lib/delivery.js';

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });

export async function onRequestGet({ request, env }) {
  const sid = new URL(request.url).searchParams.get('session_id');
  if (!sid) return json({ error: 'missing session_id' }, 400);

  let session;
  try {
    session = await stripeGet(`checkout/sessions/${encodeURIComponent(sid)}`, env.STRIPE_SECRET_KEY);
  } catch {
    return json({ error: 'invalid session' }, 400);
  }

  if (session.payment_status !== 'paid') return json({ error: 'not paid' }, 402);

  const slug = session.metadata?.slug;
  const lang = session.metadata?.lang === 'en' ? 'en' : 'hu';
  if (!slug) return json({ error: 'no product on session' }, 400);

  const origin = new URL(request.url).origin;
  const { exp, token } = await signDownload(slug, env.DOWNLOAD_SECRET);
  return json({
    url: downloadUrl(origin, slug, exp, token),
    title: CATALOG[slug]?.[lang] || CATALOG[slug]?.hu || slug,
  });
}
