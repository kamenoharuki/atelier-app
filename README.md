# Atelier

アーティスト向け閉じたSNS「Atelier」です。React + Vite 構成で、Firebase（Authentication / Cloud Firestore）をバックエンドにしています。

- メールアドレスでログインし、初回にアーティストかファンかを選択
- ファンはアーティストの12桁の鍵番号でアトリエに参加
- ギフト・応援メッセージ・ステータス変更などがリアルタイムに通知されます

## Firebase のセットアップ

1. [Firebase コンソール](https://console.firebase.google.com/) でプロジェクトを開き、ウェブアプリを追加する
2. **Authentication** > ログイン方法 で「メール / パスワード」を有効にする
3. **Firestore Database** を作成する
4. `.env.example` を `.env.local` にコピーし、ウェブアプリの `firebaseConfig` の値を入れる
5. セキュリティルールをデプロイする

   ```bash
   npx firebase-tools login
   npx firebase-tools deploy --only firestore --project <プロジェクトID>
   ```

   （CLI を使わない場合は `firestore.rules` の内容を Firestore > ルール に貼り付けて公開）

## 開発

```bash
npm install
npm run dev
```

コードの書き方を揃えるときは `npm run format` を実行します。

## フォルダ構成

```
src/
├─ main.jsx          起動処理（全体のCSSを読み込んで App を表示）
├─ App.jsx           ログイン状態に応じて画面を切り替える
├─ AtelierApp.jsx    ログイン後の本体（データの購読・タブ・各操作）
├─ constants.js      定数と、扱うデータの形の説明
├─ firebase/         Firebase の初期化（config.js）と Firestore への書き込み（database.js）
├─ hooks/            ログイン状態・Firestore のリアルタイム購読・通知トーストの管理
├─ utils/            時刻表示・エラー文・画像縮小などの小さな関数
├─ styles/           theme.css（色などの変数）/ common.css（ボタンなど共通部品）/ layout.css（画面の枠）
├─ components/
│   ├─ common/       アバター・アイコン・通知・プロフィール編集・ログイン画面の枠など
│   ├─ layout/       ヘッダー・タブバー・ステータス選択
│   ├─ home/         タイムライン・タスクカード・ギフトボタン・追加欄
│   └─ settings/     鍵番号・パスワード変更・退出ボタン
└─ screens/          画面単位（ログイン・初回設定・ホーム・通知・設定など）
```

読み始めるなら `App.jsx` → `AtelierApp.jsx` → `screens/` の順がおすすめです。データの保存処理は `firebase/database.js`、保存できる内容のルールは `firestore.rules` にあります。

## ビルド

```bash
npm run build
```

`dist/` に静的ファイルが出力されます。Vercel にデプロイする場合は、プロジェクトの環境変数に `VITE_FIREBASE_*` を設定してください。
