// Cloudflare Pages Function — スプレッドシート番号ルーム保管庫
// ルート: /api/sheet   （index.html が GET/POST で利用）
// 事前準備: Pages プロジェクト設定で KV ネームスペースを作成し、変数名「SHEET_KV」でバインド。
// データは gzip 圧縮済みバイナリをそのまま保存/返却する（中身は検証しない）。
// 注意: id（ルーム番号）はパスワードではない。機密情報は保存しない前提。
const MAX = 24 * 1024 * 1024; // 24MB（KVの上限25MB未満）

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = (url.searchParams.get('id') || '').replace(/[^0-9A-Za-z_-]/g, '').slice(0, 32);
  const cors = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PUT,OPTIONS',
    'access-control-allow-headers': 'content-type',
  };
  const jhead = { ...cors, 'content-type': 'application/json' };

  if (request.method === 'OPTIONS') return new Response('', { status: 204, headers: cors });
  if (!id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers: jhead });
  if (!env.SHEET_KV) return new Response(JSON.stringify({ error: 'KV namespace (SHEET_KV) not bound' }), { status: 500, headers: jhead });

  const key = 's_' + id;

  if (request.method === 'GET') {
    const buf = await env.SHEET_KV.get(key, 'arrayBuffer');
    if (!buf) return new Response('', { status: 204, headers: cors });
    return new Response(buf, { status: 200, headers: { ...cors, 'content-type': 'application/octet-stream' } });
  }

  if (request.method === 'POST' || request.method === 'PUT') {
    const buf = await request.arrayBuffer();
    if (buf.byteLength > MAX) return new Response(JSON.stringify({ error: 'too large' }), { status: 413, headers: jhead });
    await env.SHEET_KV.put(key, buf);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: jhead });
  }

  return new Response(JSON.stringify({ error: 'method not allowed' }), { status: 405, headers: jhead });
}
