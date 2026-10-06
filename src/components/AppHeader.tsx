import type { ArtistStatus, Profile, Role } from '../data';
import { ROLE_LABEL } from '../data';
import Avatar from './Avatar';
import StatusSelect, { StatusBadge } from './StatusSelect';
import { LogoutIcon, PencilIcon } from './icons';
import './AppHeader.css';

type Props = {
  role: Role;
  profile: Profile;
  artistName: string;
  status: ArtistStatus;
  onChangeStatus: (status: ArtistStatus) => void;
  onOpenProfile: () => void;
  onLogout: () => void;
};

export default function AppHeader({ role, profile, artistName, status, onChangeStatus, onOpenProfile, onLogout }: Props) {
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
        {role === 'artist' ? (
          <StatusSelect value={status} onChange={onChangeStatus} />
        ) : (
          <StatusBadge status={status} label={`${artistName}さん`} />
        )}
        <button type="button" className="icon-btn" onClick={onLogout} aria-label="ログアウト" title="ログアウト">
          <LogoutIcon size={18} />
        </button>
      </div>
    </header>
  );
}
