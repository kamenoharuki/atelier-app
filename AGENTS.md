# Stack

React + Vite（TypeScript）のシンプルなWeb構成です。Expo / React Native は使用しません。
バックエンドは Firebase（Authentication + Cloud Firestore）で、専用サーバーや Cloud Functions は持ちません。

- `src/lib/firebase.ts`: 初期化（設定値は `.env.local` の `VITE_FIREBASE_*`）
- `src/lib/api.ts`: Firestore への書き込み処理
- `src/hooks/useFirestore.ts`: 認証状態と Firestore のリアルタイム購読
- `src/data.ts`: 型と定数
- `firestore.rules`: セキュリティルール（データ構造の説明もここ）。書き込み処理を変えたら必ずルールも合わせて更新する
