// Cloudflare Pages Function — スプレッドシート番号ルーム保管庫
// ルート: /api/sheet  （sheet.html が GET/POST で利用）
// 事前準備: Pages プロジェクト設定で KV ネームスペースを作成し、
//           変数名「SHEET_KV」でバインドしてください。
// 注意: id（ルーム番号）はパスワードではありません。機密情報は保存しない前提。
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = (url.searchParams.get('id') || '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 32);
  const cors = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PUT,OPTIONS',
    'access-control-allow-headers': 'content-type',
  };

  if (request.method === 'OPTIONS') return new Response('', { status: 204, headers: cors });
  if (!id) return json({ error: 'id required' }, 400, cors);
  if (!env.SHEET_KV) return json({ error: 'KV namespace (SHEET_KV) not bound' }, 500, cors);

  const key = 's_' + id;

  if (request.method === 'GET') {
    const raw = await env.SHEET_KV.get(key);
    return json({ id, data: raw ? JSON.parse(raw) : null }, 200, cors);
  }

  if (request.method === 'POST' || request.method === 'PUT') {
    const body = await request.text();
    if (body.length > 500000) return json({ error: 'too large' }, 413, cors);
    try { JSON.parse(body); } catch (e) { return json({ error: 'invalid json' }, 400, cors); }
    await env.SHEET_KV.put(key, body);
    return json({ ok: true }, 200, cors);
  }

  return json({ error: 'method not allowed' }, 405, cors);
}

function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', ...extra },
  });
}
