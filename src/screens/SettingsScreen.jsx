// 設定画面（プロフィール・参加中のアトリエ／アトリエの開放と鍵番号・アカウント・ログアウト）
import { ROLE_LABEL } from '../constants';
import Avatar from '../components/common/Avatar';
import JoinAtelierForm from '../components/common/JoinAtelierForm';
import { LogoutIcon, PencilIcon } from '../components/common/icons';
import KeyCard from '../components/settings/KeyCard';
import OpenCard from '../components/settings/OpenCard';
import LeaveButton from '../components/settings/LeaveButton';
import PasswordForm from '../components/settings/PasswordForm';
import './SettingsScreen.css';

export default function SettingsScreen({
  role,
  profile,
  myUid,
  email,
  artistName,
  hasAtelier,
  isOpen,
  onChangeOpen,
  onEditProfile,
  onEditHandle,
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
            {/* 未設定のときは、いま投稿に出ている自動のID（uid の先頭8文字）を表示する */}
            {!profile.handle && <span className="settings-profile__unset">ユーザーネーム未設定</span>}
            <span className="settings-profile__handle-row">
              <span className="settings-profile__handle">@{profile.handle ?? myUid.slice(0, 8)}</span>
              <button type="button" className="settings-profile__handle-edit" onClick={onEditHandle}>
                {profile.handle ? '変更' : '設定する'}
              </button>
            </span>
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
          <h2 className="settings-card__title">参加中のルーム</h2>
          {artistName && hasAtelier ? (
            <>
              <div className="settings-row">
                <span>{artistName}さんのルーム</span>
              </div>
              <LeaveButton onLeave={onLeave} />
              <p className="settings-card__description settings-card__description--flat">
                別のルームに移る場合は、新しい鍵番号を入力してください。
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

      {role === 'artist' && <OpenCard isOpen={isOpen} onChangeOpen={onChangeOpen} />}
      {role === 'artist' && <KeyCard onLoadKey={onLoadKey} onChangeKey={onChangeKey} />}

      <section className="settings-card glass">
        <h2 className="settings-card__title">アカウント</h2>
        {email && (
          <div className="settings-row">
            <span className="settings-row__label">メールアドレス</span>
            <span className="settings-row__value">{email}</span>
          </div>
        )}
        <PasswordForm onChangePassword={onChangePassword} />
      </section>

      <button type="button" className="btn btn--danger btn--block settings-screen__logout" onClick={onLogout}>
        <LogoutIcon size={17} />
        ログアウト
      </button>
    </div>
  );
}
