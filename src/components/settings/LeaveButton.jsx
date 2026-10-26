// ファンが参加中のアトリエから退出するボタン（確認ダイアログつき）
import { useState } from 'react';
import { errorMessage } from '../../utils/errors';

export default function LeaveButton({ onLeave }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const leave = async () => {
    if (!window.confirm('このルームから退出しますか？応援回数はリセットされます。')) return;
    setBusy(true);
    try {
      await onLeave();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" className="btn btn--ghost settings-card__action" onClick={leave} disabled={busy}>
        ルームから退出する
      </button>
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
