// .env.local に Firebase の設定が無いときに出す案内画面
import AuthLayout from '../components/common/AuthLayout';

export default function SetupScreen() {
  return (
    <AuthLayout>
      <div className="login__heading">
        <h1 className="login__title">Firebase の設定が必要です</h1>
        <p className="login__lead">
          プロジェクト直下に <code>.env.local</code> を作成し、Firebase
          コンソールのウェブアプリ設定の値を入れてから開発サーバーを再起動してください。
        </p>
      </div>
      <code className="login__code">
        {`VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...`}
      </code>
      <p className="login__note">設定値は Firebase コンソールの「プロジェクトの設定」で確認できます。</p>
    </AuthLayout>
  );
}
