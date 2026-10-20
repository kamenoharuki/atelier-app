import type { ReactNode } from 'react';
import { HomeIcon, BellIcon, GearIcon } from './icons';
import './TabBar.css';

export type Tab = 'home' | 'notification' | 'settings';

const TABS: { key: Tab; label: string; icon: ReactNode }[] = [
  { key: 'home', label: 'アトリエ', icon: <HomeIcon /> },
  { key: 'notification', label: '通知', icon: <BellIcon /> },
  { key: 'settings', label: '設定', icon: <GearIcon /> },
];

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
  badges?: Partial<Record<Tab, number>>;
};

export default function TabBar({ active, onChange, badges = {} }: Props) {
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
            aria-label={badge > 0 ? `${tab.label}（未読${badge}件）` : undefined}
          >
            <span className="tab-bar__icon">
              {tab.icon}
              {badge > 0 && <span className="tab-bar__badge">{badge > 99 ? '99+' : badge}</span>}
            </span>
            <span className="tab-bar__label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
