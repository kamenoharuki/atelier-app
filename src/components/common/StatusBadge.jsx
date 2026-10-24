// 色つきの点＋文字のバッジ（オンライン / オフライン、開放中 / 閉鎖中 の表示に使う）
import { OPEN_STATE, PRESENCE } from '../../constants';
import './StatusBadge.css';

export default function StatusBadge({ color, text, label }) {
  return (
    <span className="status-badge" style={{ '--status-color': color }}>
      <span className="status-dot" />
      {label && <span className="status-badge__label">{label}</span>}
      <span>{text}</span>
    </span>
  );
}

// オンライン / オフライン（label にはアーティスト名などを入れる）
export function PresenceBadge({ online, label }) {
  const state = online ? PRESENCE.online : PRESENCE.offline;
  return <StatusBadge color={state.color} text={state.label} label={label} />;
}

// アトリエの開放中 / 閉鎖中
export function OpenBadge({ isOpen }) {
  const state = isOpen ? OPEN_STATE.open : OPEN_STATE.closed;
  return <StatusBadge color={state.color} text={state.label} />;
}
