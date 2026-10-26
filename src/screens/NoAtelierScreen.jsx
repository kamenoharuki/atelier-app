// ファンがまだアトリエに参加していないときのホーム
import JoinAtelierForm from '../components/common/JoinAtelierForm';
import './HomeScreen.css';

export default function NoAtelierScreen({ denied, onJoin }) {
  return (
    <div className="home-screen">
      <section className="hero glass">
        <div className="hero__orb" aria-hidden="true" />
        <div className="hero__body">
          <span className="eyebrow">ルームに参加する</span>
          <h1 className="hero__title">Secret Atelier</h1>
          <p className="hero__lead">
            {denied
              ? 'このルームを見る権限がなくなりました。新しい鍵番号を受け取って参加し直してください。'
              : 'アーティストから受け取った鍵番号を入力すると、ルームに入れます。'}
          </p>
        </div>
      </section>
      <div className="card glass">
        <JoinAtelierForm onJoin={onJoin} />
      </div>
    </div>
  );
}
