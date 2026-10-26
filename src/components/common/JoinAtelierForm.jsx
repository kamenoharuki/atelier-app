// ファンが鍵番号を入力してアトリエに参加するフォーム
import { useState } from 'react';
import { KEY_LENGTH } from '../../constants';
import { KeyNotFoundError, isValidKey } from '../../firebase/database';
import { errorMessage } from '../../utils/errors';
import './JoinAtelierForm.css';

export default function JoinAtelierForm({ onJoin }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!isValidKey(key)) {
      setError(`鍵番号は${KEY_LENGTH}桁の数字です`);
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onJoin(key);
      setKey('');
    } catch (err) {
      setError(err instanceof KeyNotFoundError ? 'この鍵番号のルームは見つかりませんでした' : errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="join-form" onSubmit={submit} noValidate>
      <label className="field">
        <span className="field__label">ルームの鍵番号</span>
        <div className="join-form__row">
          <input
            className="input"
            inputMode="numeric"
            autoComplete="off"
            placeholder={`${KEY_LENGTH}桁の数字`}
            maxLength={KEY_LENGTH}
            value={key}
            onChange={(e) => {
              setKey(e.target.value.replace(/\D/g, ''));
              if (error) setError('');
            }}
          />
          <button type="submit" className="btn btn--primary" disabled={busy}>
            参加する
          </button>
        </div>
      </label>
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
