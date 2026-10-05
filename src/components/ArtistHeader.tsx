import type { CSSProperties } from 'react';
import type { ArtistStatus } from '../data';
import { STATUS_ORDER } from '../data';
import { PersonIcon } from './icons';
import './ArtistHeader.css';

const STATUS_STYLE: Record<ArtistStatus, { color: string; glow: string; code: string }> = {
  制作中: { color: 'var(--neon-blue)', glow: 'var(--glow-blue)', code: 'ONLINE' },
  休憩中: { color: 'var(--color-accent-light)', glow: 'var(--glow-purple)', code: 'IDLE' },
  退室中: { color: 'var(--neon-pink)', glow: 'var(--glow-pink)', code: 'OFFLINE' },
};

type Props = {
  name: string;
  status: ArtistStatus;
  onChangeStatus: (status: ArtistStatus) => void;
};

export default function ArtistHeader({ name, status, onChangeStatus }: Props) {
  const style = STATUS_STYLE[status];

  const cycleStatus = () => {
    const next = STATUS_ORDER[(STATUS_ORDER.indexOf(status) + 1) % STATUS_ORDER.length];
    onChangeStatus(next);
  };

  return (
    <div className="artist-header">
      <div className="artist-header__identity">
        <div className="artist-header__avatar">
          <PersonIcon size={22} color="var(--neon-blue)" />
        </div>
        <div className="artist-header__meta">
          <span className="hud-label">Secret Atelier // Owner</span>
          <span className="artist-header__name">{name}</span>
        </div>
      </div>

      <button
        type="button"
        className="artist-header__status"
        style={{ '--status-color': style.color, '--status-glow': style.glow } as CSSProperties}
        onClick={cycleStatus}
      >
        <span className="artist-header__dot" />
        <span className="artist-header__code">{style.code}</span>
        <span>{status}</span>
      </button>
    </div>
  );
}
