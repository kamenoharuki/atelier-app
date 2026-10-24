// メールアドレスでログインしている人のパスワード変更フォーム
import { useState } from 'react';
import { errorMessage } from '../../utils/errors';

const PASSWORD_MIN = 6;

export default function PasswordForm({ onChangePassword }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < PASSWORD_MIN) {
      setError(`パスワードは${PASSWORD_MIN}文字以上にしてください`);
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onChangePassword(password);
      setPassword('');
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="settings-form" onSubmit={submit} noValidate>
      <label className="field">
        <span className="field__label">新しいパスワード</span>
        <input
          type="password"
          className="input"
          autoComplete="new-password"
          placeholder={`${PASSWORD_MIN}文字以上`}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setDone(false);
            if (error) setError('');
          }}
        />
      </label>
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
      {done && (
        <p className="settings-form__success" role="status">
          パスワードを変更しました
        </p>
      )}
      <button type="submit" className="btn btn--secondary settings-card__action" disabled={busy}>
        パスワードを変更する
      </button>
    </form>
  );
}
