// ログイン・初回設定・読み込み中など、ログイン前後の画面で共通の枠
//   brand: 上に出す文字（読み込み中は「Loading」にする）
import './AuthLayout.css';

export default function AuthLayout({ brand = 'Secret Atelier', children }) {
  return (
    <div className="page">
      <main className="login">
        <div className="login__panel glass">
          <div className="login__brand">
            <span className="login__mark" aria-hidden="true" />
            {brand}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
