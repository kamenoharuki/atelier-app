import { useState } from 'react';
import type { FormEvent } from 'react';
import { KEY_LENGTH } from '../data';
import { KeyNotFoundError, isValidKey } from '../lib/api';
import { errorMessage } from '../lib/format';
import './JoinAtelierForm.css';

type Props = {
  onJoin: (key: string) => Promise<void>;
};

export default function JoinAtelierForm({ onJoin }: Props) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
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
      setError(err instanceof KeyNotFoundError ? 'この鍵番号のアトリエは見つかりませんでした' : errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="join-form" onSubmit={submit} noValidate>
      <label className="field">
        <span className="field__label">アトリエの鍵番号</span>
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
