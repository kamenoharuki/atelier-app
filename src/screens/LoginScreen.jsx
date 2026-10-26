// ログイン・新規登録画面（メールアドレスとパスワード）
import { useState } from 'react';
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import AuthLayout from '../components/common/AuthLayout';
import { auth } from '../firebase/config';
import { errorMessage } from '../utils/errors';
import './LoginScreen.css';

export default function LoginScreen() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (action) => {
    setBusy(true);
    setError('');
    setInfo('');
    try {
      await action();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    run(() =>
      mode === 'login'
        ? signInWithEmailAndPassword(auth, email.trim(), password)
        : createUserWithEmailAndPassword(auth, email.trim(), password),
    );
  };

  const resetPassword = () => {
    if (!email.trim()) {
      setError('パスワード再設定用のメールアドレスを入力してください');
      return;
    }
    run(async () => {
      await sendPasswordResetEmail(auth, email.trim());
      setInfo('パスワード再設定用のメールを送信しました');
    });
  };

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setInfo('');
  };

  return (
    <AuthLayout>
      <div className="login__heading">
        <h1 className="login__title">{mode === 'login' ? 'ルームへようこそ' : 'アカウントを作成'}</h1>
        <p className="login__lead">
          {mode === 'login'
            ? 'メールアドレスとパスワードでログインしてください。'
            : '登録後に、アーティストかファンかを選びます。'}
        </p>
      </div>

      <div className="login__tabs" role="tablist">
        {['login', 'signup'].map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            className={`login__tab ${mode === m ? 'is-active' : ''}`}
            onClick={() => switchMode(m)}
          >
            {m === 'login' ? 'ログイン' : '新規登録'}
          </button>
        ))}
      </div>

      <form className="login__form" onSubmit={submit} noValidate>
        <label className="field">
          <span className="field__label">メールアドレス</span>
          <input
            type="email"
            className="input"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field__label">パスワード</span>
          <input
            type="password"
            className="input"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder={mode === 'signup' ? '6文字以上' : ''}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && (
          <p className="field__error" role="alert">
            {error}
          </p>
        )}
        {info && (
          <p className="login__info" role="status">
            {info}
          </p>
        )}

        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
          {mode === 'login' ? 'ログイン' : '登録する'}
        </button>
        {mode === 'login' && (
          <button type="button" className="login__link" onClick={resetPassword} disabled={busy}>
            パスワードを忘れた場合
          </button>
        )}
      </form>
    </AuthLayout>
  );
}
