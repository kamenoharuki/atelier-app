import type { ArtistStatus } from '../data';
import { STATUS_ORDER } from '../data';
import { PersonIcon } from './icons';
import './ArtistHeader.css';

const STATUS_STYLE: Record<ArtistStatus, { bg: string; fg: string; dot: string }> = {
  制作中: { bg: 'var(--color-primary-muted)', fg: 'var(--color-primary)', dot: 'var(--color-primary)' },
  休憩中: { bg: '#efede6', fg: 'var(--color-text-muted)', dot: 'var(--color-text-muted)' },
  退室中: { bg: '#efe3e0', fg: 'var(--color-danger)', dot: 'var(--color-danger)' },
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
          <PersonIcon size={22} color="var(--color-text-muted)" />
        </div>
        <span className="artist-header__name">{name}</span>
      </div>

      <button
        type="button"
        className="artist-header__status"
        style={{ backgroundColor: style.bg, color: style.fg }}
        onClick={cycleStatus}
      >
        <span className="artist-header__dot" style={{ backgroundColor: style.dot }} />
        {status}
      </button>
    </div>
  );
}
