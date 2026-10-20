import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { ArtistStatus, Profile, Role } from '../data';
import { KEY_LENGTH, ROLE_LABEL } from '../data';
import Avatar from '../components/Avatar';
import JoinAtelierForm from '../components/JoinAtelierForm';
import { StatusBadge } from '../components/StatusSelect';
import { LogoutIcon, PencilIcon } from '../components/icons';
import { generateKey, isValidKey } from '../lib/api';
import { errorMessage } from '../lib/format';
import './SettingsScreen.css';

const PASSWORD_MIN = 6;

type Props = {
  role: Role;
  profile: Profile;
  email: string | null;
  canChangePassword: boolean;
  artistName?: string;
  status?: ArtistStatus;
  onEditProfile: () => void;
  onLogout: () => void;
  onChangePassword: (password: string) => Promise<void>;
  onJoin: (key: string) => Promise<void>;
  onLeave: () => Promise<void>;
  onLoadKey: () => Promise<string | null>;
  onChangeKey: (oldKey: string | null, newKey: string) => Promise<void>;
};

export default function SettingsScreen({
  role,
  profile,
  email,
  canChangePassword,
  artistName,
  status,
  onEditProfile,
  onLogout,
  onChangePassword,
  onJoin,
  onLeave,
  onLoadKey,
  onChangeKey,
}: Props) {
  return (
    <div className="settings-screen">
      <section className="settings-card glass">
        <h2 className="settings-card__title">プロフィール</h2>
        <div className="settings-profile">
          <Avatar avatar={profile.avatar} size={56} />
          <div className="settings-profile__text">
            <span className="settings-profile__name">{profile.name}</span>
            <span className="settings-profile__role">{ROLE_LABEL[role]}としてログイン中</span>
          </div>
          <button type="button" className="btn btn--secondary" onClick={onEditProfile}>
            <PencilIcon size={14} />
            編集
          </button>
        </div>
      </section>

      {role === 'fan' && (
        <section className="settings-card glass">
          <h2 className="settings-card__title">参加中のアトリエ</h2>
          {artistName && status ? (
            <>
              <div className="settings-row">
                <span>{artistName}さんのアトリエ</span>
                <StatusBadge status={status} />
              </div>
              <LeaveButton onLeave={onLeave} />
              <p className="settings-card__description settings-card__description--flat">
                別のアトリエに移る場合は、新しい鍵番号を入力してください。
              </p>
            </>
          ) : (
            <p className="settings-card__description settings-card__description--flat">
              アーティストから受け取った鍵番号を入力して参加します。
            </p>
          )}
          <JoinAtelierForm onJoin={onJoin} />
        </section>
      )}

      {role === 'artist' && <KeyCard onLoadKey={onLoadKey} onChangeKey={onChangeKey} />}

      <section className="settings-card glass">
        <h2 className="settings-card__title">アカウント</h2>
        {email && (
          <div className="settings-row">
            <span className="settings-row__label">メールアドレス</span>
            <span className="settings-row__value">{email}</span>
          </div>
        )}
        {canChangePassword ? (
          <PasswordForm onChangePassword={onChangePassword} />
        ) : (
          <p className="settings-card__description settings-card__description--flat">
            Google アカウントでログインしています。パスワードは Google 側で管理されます。
          </p>
        )}
      </section>

      <button type="button" className="btn btn--danger btn--block settings-screen__logout" onClick={onLogout}>
        <LogoutIcon size={17} />
        ログアウト
      </button>
    </div>
  );
}

function LeaveButton({ onLeave }: { onLeave: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const leave = async () => {
    if (!window.confirm('このアトリエから退出しますか？応援回数はリセットされます。')) return;
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
        アトリエから退出する
      </button>
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}

function PasswordForm({ onChangePassword }: { onChangePassword: (password: string) => Promise<void> }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
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

type KeyCardProps = {
  onLoadKey: () => Promise<string | null>;
  onChangeKey: (oldKey: string | null, newKey: string) => Promise<void>;
};

function KeyCard({ onLoadKey, onChangeKey }: KeyCardProps) {
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    onLoadKey()
      .then((key) => active && setCurrentKey(key))
      .catch(() => active && setError('鍵番号を読み込めませんでした'))
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, [onLoadKey]);

  const copy = async () => {
    if (!currentKey) return;
    try {
      await navigator.clipboard.writeText(currentKey);
      setMessage('コピーしました');
    } catch {
      setVisible(true);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidKey(draft)) {
      setError(`鍵番号は${KEY_LENGTH}桁の数字にしてください`);
      return;
    }
    if (draft === currentKey) {
      setError('現在の鍵番号と同じです');
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await onChangeKey(currentKey, draft);
      setCurrentKey(draft);
      setDraft('');
      setMessage('鍵番号を変更しました。参加済みのファンはそのまま残ります');
    } catch (err) {
      setError(errorMessage(err, 'この鍵番号は使用できません。別の番号をお試しください'));
    } finally {
      setBusy(false);
    }
  };

  const masked = currentKey ? (visible ? currentKey : '•'.repeat(KEY_LENGTH)) : loaded ? '未設定' : '読み込み中…';

  return (
    <section className="settings-card glass">
      <h2 className="settings-card__title">アトリエの鍵番号</h2>
      <p className="settings-card__description">ファンをアトリエに招待するときに伝える{KEY_LENGTH}桁の番号です。</p>

      <div className="key-display">
        <span className="key-display__value">{masked}</span>
        {currentKey && (
          <>
            <button type="button" className="btn btn--ghost" onClick={() => setVisible((v) => !v)}>
              {visible ? '隠す' : '表示'}
            </button>
            <button type="button" className="btn btn--secondary" onClick={copy}>
              コピー
            </button>
          </>
        )}
      </div>

      <form className="settings-form" onSubmit={submit} noValidate>
        <label className="field">
          <span className="field__label">新しい鍵番号</span>
          <div className="key-input">
            <input
              className="input"
              inputMode="numeric"
              autoComplete="off"
              placeholder={`${KEY_LENGTH}桁の数字`}
              maxLength={KEY_LENGTH}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value.replace(/\D/g, ''));
                if (error) setError('');
              }}
            />
            <button type="button" className="btn btn--ghost" onClick={() => setDraft(generateKey())}>
              自動生成
            </button>
          </div>
        </label>
        {error && (
          <p className="field__error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="settings-form__success" role="status">
            {message}
          </p>
        )}
        <button type="submit" className="btn btn--secondary settings-card__action" disabled={busy}>
          鍵番号を変更する
        </button>
      </form>
    </section>
  );
}
