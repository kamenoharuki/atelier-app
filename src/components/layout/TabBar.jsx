// 画面下部のタブ（ホーム・通知・設定）
import { HomeIcon, BellIcon, GearIcon } from '../common/icons';
import './TabBar.css';

const TABS = [
  { key: 'home', label: 'ルーム', icon: <HomeIcon /> },
  { key: 'notification', label: '通知', icon: <BellIcon /> },
  { key: 'settings', label: '設定', icon: <GearIcon /> },
];

export default function TabBar({ active, onChange, badges = {} }) {
  return (
    <nav className="tab-bar" aria-label="メインメニュー">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const badge = badges[tab.key] ?? 0;
        return (
          <button
            key={tab.key}
            type="button"
            className={`tab-bar__item ${isActive ? 'is-active' : ''}`}
            onClick={() => onChange(tab.key)}
            aria-current={isActive ? 'page' : undefined}
            // 文字ラベルは出さないので、読み上げ名とツールチップで補う
            aria-label={badge > 0 ? `${tab.label}（未読${badge}件）` : tab.label}
            title={tab.label}
          >
            <span className="tab-bar__icon">
              {tab.icon}
              {badge > 0 && <span className="tab-bar__badge">{badge > 99 ? '99+' : badge}</span>}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
