# EarthWISE Sheet（番号ルーム共有スプレッドシート）

`sheet.earthwisecompany.com` として独立配信するミニアプリ。

- `index.html` … スプレッドシート本体（ログイン不要）
- `functions/api/sheet.js` … Cloudflare Pages Function（`/api/sheet`）。KV に番号ルームを保存

メインサイト（earthwisecompany.com）とは**完全に別管理**。CSS・JS・favicon等はすべて同梱済みで自己完結（メインサイトへは依存・リンクしない）。カスタムドメイン（手順4）は任意で、Cloudflareが発行する `*.pages.dev` のURLのままでも動く。

## デプロイ手順（GitHub → Cloudflare Pages）

1. **GitHubにこのフォルダをpush**
   - 新しいリポジトリ（例: `earthwise-sheet`）を作り、このフォルダの中身（`index.html` と `functions/`）をアップロード／push する。

2. **Cloudflare Pagesプロジェクトを作成**
   - Cloudflare ダッシュボード →「Workers & Pages」→「Create」→「Pages」→「Connect to Git」
   - 上のリポジトリを選択。ビルド設定は「Framework preset: なし」「Build command: 空」「Output directory: `/`（ルート）」でOK（ビルド不要）。

3. **KVネームスペースを作成してバインド**
   - 「Storage & Databases」→「KV」→「Create a namespace」→ 名前例 `ew-sheet`
   - 作成したPagesプロジェクト →「Settings」→「Functions」→「KV namespace bindings」→「Add」
   - **Variable name: `SHEET_KV`** / KV namespace: `ew-sheet` を選んで保存（Production）。

4. **カスタムドメインを設定**
   - Pagesプロジェクト →「Custom domains」→「Set up a custom domain」→ `sheet.earthwisecompany.com`
   - CloudflareでDNSを管理していれば自動でCNAMEが追加される。

5. **確認**
   - `https://sheet.earthwisecompany.com/?1001` を開く → 何か入力 → 別端末で同じ `?1001` を開いて同期されればOK。
   - 状態表示が「保存済み」になる。エラーなら KV バインド名が `SHEET_KV` か確認。

## 更新時
GitHubに push するだけで自動で再デプロイされる。
