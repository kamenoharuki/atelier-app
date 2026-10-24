// ログイン状態やプロフィールを確認している間の画面
import AuthLayout from '../components/common/AuthLayout';

export default function LoadingScreen() {
  return (
    <AuthLayout>
      <div className="login__spinner" role="status" aria-label="読み込み中" />
    </AuthLayout>
  );
}
