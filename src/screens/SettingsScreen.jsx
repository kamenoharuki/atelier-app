// 設定画面（プロフィール・参加中のアトリエ／鍵番号・アカウント・ログアウト）
import { ROLE_LABEL } from '../constants';
import Avatar from '../components/common/Avatar';
import JoinAtelierForm from '../components/common/JoinAtelierForm';
import { StatusBadge } from '../components/layout/StatusSelect';
import { LogoutIcon, PencilIcon } from '../components/common/icons';
import KeyCard from '../components/settings/KeyCard';
import LeaveButton from '../components/settings/LeaveButton';
import PasswordForm from '../components/settings/PasswordForm';
import './SettingsScreen.css';

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
}) {
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
