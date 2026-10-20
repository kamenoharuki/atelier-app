# Atelier

アーティスト向け閉じたSNS「Atelier」です。React + Vite 構成で、Firebase（Authentication / Cloud Firestore）をバックエンドにしています。

- メールアドレス / Google でログインし、初回にアーティストかファンかを選択
- ファンはアーティストの12桁の鍵番号でアトリエに参加
- ギフト・応援メッセージ・ステータス変更などがリアルタイムに通知されます

## Firebase のセットアップ

1. [Firebase コンソール](https://console.firebase.google.com/) でプロジェクトを開き、ウェブアプリを追加する
2. **Authentication** > ログイン方法 で「メール / パスワード」と「Google」を有効にする
3. **Firestore Database** を作成する
4. `.env.example` を `.env.local` にコピーし、ウェブアプリの `firebaseConfig` の値を入れる
5. セキュリティルールをデプロイする

   ```bash
   npx firebase-tools login
   npx firebase-tools deploy --only firestore --project <プロジェクトID>
   ```

   （CLI を使わない場合は `firestore.rules` の内容を Firestore > ルール に貼り付けて公開）

6. 本番ドメイン（Vercel など）で Google ログインを使う場合は、Authentication > 設定 > 承認済みドメイン にそのドメインを追加する

## 開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

`dist/` に静的ファイルが出力されます。Vercel にデプロイする場合は、プロジェクトの環境変数に `VITE_FIREBASE_*` を設定してください。
