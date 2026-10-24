# Stack

React + Vite（JavaScript / JSX）のシンプルなWeb構成です。TypeScript・Expo / React Native は使用しません。
バックエンドは Firebase（Authentication + Cloud Firestore）で、専用サーバーや Cloud Functions は持ちません。

- `src/firebase/config.js`: 初期化（設定値は `.env.local` の `VITE_FIREBASE_*`）
- `src/firebase/database.js`: Firestore への書き込み処理
- `src/hooks/`: 認証状態（`useAuthUser`）と Firestore のリアルタイム購読（`useSnapshot` / `useAtelier`）
- `src/constants.js`: 定数と、扱うデータの形の説明
- `firestore.rules`: セキュリティルール（データ構造の説明もここ）。書き込み処理を変えたら必ずルールも合わせて更新する

# Code style

- ユーザーがコードを読むので、各ファイルの先頭に「何をするファイルか」を日本語で1〜2行書く
- 画面は `src/screens/`、画面の部品は `src/components/<画面名 or common / layout>/` に置き、CSS は同じ名前で隣に置く
- 全体で共通のスタイルは `src/styles/`（`theme.css` は色などの変数、`common.css` はボタン・入力欄・カードなどの共通部品）
- 整形は `npm run format`（Prettier）
