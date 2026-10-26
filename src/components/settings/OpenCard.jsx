// アーティストがアトリエを開放 / 閉鎖する設定。切り替えるとファンに通知される
import { useState } from 'react';
import { OpenBadge } from '../common/StatusBadge';
import { errorMessage } from '../../utils/errors';

export default function OpenCard({ isOpen, onChangeOpen }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const toggle = async () => {
    setBusy(true);
    setError('');
    try {
      await onChangeOpen(!isOpen);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="settings-card glass">
      <h2 className="settings-card__title">ルームの開放</h2>
      <p className="settings-card__description">
        開放中か閉鎖中かは、画面右上に表示されます。切り替えるとファンに通知が届きます。
      </p>
      <div className="settings-row">
        <OpenBadge isOpen={isOpen} />
        <button
          type="button"
          className={`btn ${isOpen ? 'btn--secondary' : 'btn--primary'}`}
          onClick={toggle}
          disabled={busy}
        >
          {isOpen ? 'ルームを閉鎖する' : 'ルームを開放する'}
        </button>
      </div>
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
