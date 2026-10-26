// 画面上部のヘッダー（アバター・名前／右上に ログアウト。アーティストにはアトリエの開放状態とオンライン状態も出す）
//   ファンには、ログアウトの左に「今日あと何回コメントできるか」をゲームのライフのようにハートで出す
import { ROLE_LABEL } from '../../constants';
import Avatar from '../common/Avatar';
import { OpenBadge, PresenceBadge } from '../common/StatusBadge';
import { HeartIcon, LogoutIcon, PencilIcon } from '../common/icons';
import './AppHeader.css';

export default function AppHeader({ role, profile, showStatus, isOpen, lives, livesMax, onOpenProfile, onLogout }) {
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
        {showStatus && (
          <>
            <OpenBadge isOpen={isOpen} />
            {/* サイトを見ている本人は常にオンライン */}
            <PresenceBadge online />
          </>
        )}
        {lives !== null && lives !== undefined && <LifeMeter lives={lives} max={livesMax} />}
        <button type="button" className="icon-btn" onClick={onLogout} aria-label="ログアウト" title="ログアウト">
          <LogoutIcon size={18} />
        </button>
      </div>
    </header>
  );
}

// 残りのコメント回数を、塗りつぶしのハート（残り）と空のハート（使った分）で表す
function LifeMeter({ lives, max }) {
  const label = `今日コメントできるのはあと${lives}回`;
  return (
    <span className={`life-meter ${lives === 0 ? 'is-empty' : ''}`} role="img" aria-label={label} title={label}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`life-meter__heart ${i < lives ? 'is-full' : ''}`}>
          <HeartIcon size={18} strokeWidth={2} fill={i < lives ? 'currentColor' : 'none'} />
        </span>
      ))}
    </span>
  );
}
