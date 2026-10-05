import type { ReactNode } from 'react';
import { HomeIcon, BellIcon, GearIcon } from './icons';
import './TabBar.css';

export type Tab = 'home' | 'notification' | 'settings';

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
};

export default function TabBar({ active, onChange }: Props) {
  const tabs: { key: Tab; label: string; icon: (color: string) => ReactNode }[] = [
    { key: 'home', label: 'ATELIER', icon: (color) => <HomeIcon color={color} /> },
    { key: 'notification', label: 'SIGNAL', icon: (color) => <BellIcon color={color} /> },
    { key: 'settings', label: 'SYSTEM', icon: (color) => <GearIcon color={color} /> },
  ];

  return (
    <div className="tab-bar">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        const color = isActive ? 'var(--neon-blue)' : 'var(--color-text-muted)';
        return (
          <button
            key={tab.key}
            type="button"
            className={`tab-bar__item ${isActive ? 'is-active' : ''}`}
            onClick={() => onChange(tab.key)}
            aria-label={tab.label}
          >
            {tab.icon(color)}
            <span className="tab-bar__label">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
