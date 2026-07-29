// Gated file download: validates the signed token, then streams <slug>.zip
// from the R2 bucket bound as `PRODUCTS`.
// Binding required: PRODUCTS (R2)   Env required: DOWNLOAD_SECRET
import { verifyDownload } from '../_lib/delivery.js';

export async function onRequestGet({ request, env, params }) {
  const slug = params.slug;
  const url = new URL(request.url);
  const exp = url.searchParams.get('exp');
  const token = url.searchParams.get('token');

  if (!(await verifyDownload(slug, exp, token, env.DOWNLOAD_SECRET))) {
    return new Response('Download link expired or invalid.', { status: 403 });
  }

  const object = await env.PRODUCTS.get(`${slug}.zip`);
  if (!object) return new Response('File not found.', { status: 404 });

  return new Response(object.body, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${slug}.zip"`,
      'Cache-Control': 'no-store',
    },
  });
}
