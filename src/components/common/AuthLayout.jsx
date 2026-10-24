// ログイン・初回設定・読み込み中など、ログイン前後の画面で共通の枠
import './AuthLayout.css';

export default function AuthLayout({ children }) {
  return (
    <div className="page">
      <main className="login">
        <div className="login__panel glass">
          <div className="login__brand">
            <span className="login__mark" aria-hidden="true" />
            Secret Atelier
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
