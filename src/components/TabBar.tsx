import type { ReactNode } from 'react';
import { HomeIcon, BellIcon, GearIcon } from './icons';
import './TabBar.css';

export type Tab = 'home' | 'notification' | 'settings';

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
};

export default function TabBar({ active, onChange }: Props) {
  const tabs: { key: Tab; icon: (color: string) => ReactNode }[] = [
    { key: 'home', icon: (color) => <HomeIcon color={color} /> },
    { key: 'notification', icon: (color) => <BellIcon color={color} /> },
    { key: 'settings', icon: (color) => <GearIcon color={color} /> },
  ];

  return (
    <div className="tab-bar">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        const color = isActive ? 'var(--color-text)' : 'var(--color-text-muted)';
        return (
          <button
            key={tab.key}
            type="button"
            className="tab-bar__item"
            onClick={() => onChange(tab.key)}
          >
            {tab.icon(color)}
          </button>
        );
      })}
    </div>
  );
}
