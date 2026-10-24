// 初回ログイン時の設定画面（表示名と、アーティスト / ファンの選択）
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { DEFAULT_AVATAR } from '../constants';
import { createUserProfile } from '../firebase/database';
import { auth } from '../firebase/config';
import { errorMessage } from '../utils/errors';
import { BrushIcon, CheckIcon, HeartIcon } from '../components/common/icons';
import AuthLayout from '../components/common/AuthLayout';
import './OnboardingScreen.css';

const NAME_MAX = 20;

const ROLES = [
  {
    role: 'artist',
    title: 'アーティストとしてはじめる',
    description: '制作のTODOや悩みを共有し、アトリエのステータスを管理します。',
    icon: <BrushIcon size={22} />,
  },
  {
    role: 'fan',
    title: 'ファンとしてはじめる',
    description: '鍵番号でアトリエに参加して、ギフトや応援メッセージを届けます。',
    icon: <HeartIcon size={22} />,
  },
];

export default function OnboardingScreen({ uid, defaultName }) {
  const [name, setName] = useState(defaultName.slice(0, NAME_MAX));
  const [role, setRole] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return setError('ユーザーネームを入力してください');
    if (!role) return setError('アーティストかファンかを選んでください');
    setBusy(true);
    setError('');
    try {
      await createUserProfile(uid, role, { name: trimmed, avatar: DEFAULT_AVATAR });
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <AuthLayout>
      <div className="login__heading">
        <h1 className="login__title">はじめまして</h1>
        <p className="login__lead">表示名と、このアカウントの立場を選んでください。</p>
      </div>

      <form className="login__form" onSubmit={submit} noValidate>
        <label className="field">
          <span className="field__label">ユーザーネーム</span>
          <input
            className="input"
            maxLength={NAME_MAX}
            placeholder="表示名を入力"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <div className="login__roles" role="radiogroup" aria-label="立場">
          {ROLES.map((item) => {
            const selected = role === item.role;
            return (
              <button
                key={item.role}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`role-card role-card--${item.role} ${selected ? 'is-selected' : ''}`}
                onClick={() => setRole(item.role)}
              >
                <span className="role-card__icon">{item.icon}</span>
                <span className="role-card__body">
                  <span className="role-card__title">{item.title}</span>
                  <span className="role-card__description">{item.description}</span>
                </span>
                {selected && <CheckIcon color="var(--color-primary)" />}
              </button>
            );
          })}
        </div>
        <p className="login__note">立場はあとから変更できません。</p>

        {error && (
          <p className="field__error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
          はじめる
        </button>
        <button type="button" className="login__link" onClick={() => signOut(auth)} disabled={busy}>
          別のアカウントでログインする
        </button>
      </form>
    </AuthLayout>
  );
}
