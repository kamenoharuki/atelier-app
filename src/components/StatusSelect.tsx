import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { ArtistStatus } from '../data';
import { STATUS_COLOR, STATUS_OPTIONS } from '../data';
import { CheckIcon, ChevronDownIcon } from './icons';
import './StatusSelect.css';

const statusStyle = (status: ArtistStatus) => ({ '--status-color': STATUS_COLOR[status] }) as CSSProperties;

type Props = {
  value: ArtistStatus;
  onChange: (status: ArtistStatus) => void;
};

export default function StatusSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const select = (status: ArtistStatus) => {
    onChange(status);
    setOpen(false);
  };

  return (
    <div className="status-select" ref={rootRef}>
      <button
        type="button"
        className={`status-select__trigger ${open ? 'is-open' : ''}`}
        style={statusStyle(value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`ステータス: ${value}（変更する）`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="status-dot" />
        <span className="status-select__value">{value}</span>
        <ChevronDownIcon />
      </button>

      {open && (
        <ul className="status-select__menu" role="listbox" aria-label="ステータスを選択">
          {STATUS_OPTIONS.map((option) => {
            const selected = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={`status-select__option ${selected ? 'is-selected' : ''}`}
                  style={statusStyle(option.value)}
                  onClick={() => select(option.value)}
                >
                  <span className="status-dot" />
                  <span className="status-select__text">
                    <span className="status-select__label">{option.value}</span>
                    <span className="status-select__hint">{option.hint}</span>
                  </span>
                  {selected && <CheckIcon color="var(--color-primary)" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

type BadgeProps = {
  status: ArtistStatus;
  label?: string;
};

export function StatusBadge({ status, label }: BadgeProps) {
  return (
    <span className="status-badge" style={statusStyle(status)}>
      <span className="status-dot" />
      {label && <span className="status-badge__label">{label}</span>}
      <span>{status}</span>
    </span>
  );
}
