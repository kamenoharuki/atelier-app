// 画面上部のヘッダー（アバター・名前／右上に アトリエの開放状態・アーティストのオンライン状態・ログアウト）
import { ROLE_LABEL } from '../../constants';
import Avatar from '../common/Avatar';
import { OpenBadge, PresenceBadge } from '../common/StatusBadge';
import { LogoutIcon, PencilIcon } from '../common/icons';
import './AppHeader.css';

export default function AppHeader({
  role,
  profile,
  artistName,
  hasAtelier,
  isOpen,
  isOnline,
  onOpenProfile,
  onLogout,
}) {
  return (
    <header className="app-header">
      <button type="button" className="app-header__identity" onClick={onOpenProfile} aria-label="プロフィールを編集">
        <span className="app-header__avatar">
          <Avatar avatar={profile.avatar} size={44} />
          <span className="app-header__edit" aria-hidden="true">
            <PencilIcon size={11} />
          </span>
        </span>
        <span className="app-header__meta">
          <span className="app-header__role">{ROLE_LABEL[role]}</span>
          <span className="app-header__name">{profile.name}</span>
        </span>
      </button>

      <div className="app-header__actions">
        {hasAtelier && (
          <>
            <OpenBadge isOpen={isOpen} />
            <PresenceBadge online={isOnline} label={role === 'fan' && artistName ? `${artistName}さん` : undefined} />
          </>
        )}
        <button type="button" className="icon-btn" onClick={onLogout} aria-label="ログアウト" title="ログアウト">
          <LogoutIcon size={18} />
        </button>
      </div>
    </header>
  );
}
