// ログイン・新規登録画面（メールアドレス / Google）
import { useState } from 'react';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import AuthLayout from '../components/common/AuthLayout';
import { auth } from '../firebase/config';
import { errorMessage, isCancelled } from '../utils/errors';
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
      if (!isCancelled(e)) setError(errorMessage(e));
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

  const signInWithGoogle = () => run(() => signInWithPopup(auth, new GoogleAuthProvider()));

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
        <h1 className="login__title">{mode === 'login' ? 'アトリエへようこそ' : 'アカウントを作成'}</h1>
        <p className="login__lead">
          {mode === 'login'
            ? 'メールアドレスまたは Google でログインしてください。'
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

      <div className="login__divider">
        <span>または</span>
      </div>

      <button type="button" className="btn btn--secondary btn--block" onClick={signInWithGoogle} disabled={busy}>
        <GoogleMark />
        Google で続ける
      </button>
    </AuthLayout>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5Z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5Z"
      />
    </svg>
  );
}
