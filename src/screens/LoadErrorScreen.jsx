// プロフィールを読み込めなかったときの画面（通信エラーやルール未デプロイなど）
import { signOut } from 'firebase/auth';
import AuthLayout from '../components/common/AuthLayout';
import { auth } from '../firebase/config';

export default function LoadErrorScreen() {
  return (
    <AuthLayout>
      <div className="login__heading">
        <h1 className="login__title">データを読み込めませんでした</h1>
        <p className="login__lead">
          通信状況を確認して再読み込みしてください。解決しない場合は、Firestore
          のセキュリティルール（firestore.rules）がデプロイされているか確認してください。
        </p>
      </div>
      <button type="button" className="btn btn--primary btn--block" onClick={() => window.location.reload()}>
        再読み込み
      </button>
      <button type="button" className="login__link" onClick={() => signOut(auth)}>
        ログアウト
      </button>
    </AuthLayout>
  );
}
