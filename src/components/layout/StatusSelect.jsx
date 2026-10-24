// アーティストのステータス選択メニューと、ステータス表示用のバッジ
import { useEffect, useRef, useState } from 'react';
import { STATUS_COLOR, STATUS_OPTIONS } from '../../constants';
import { CheckIcon, ChevronDownIcon } from '../common/icons';
import './StatusSelect.css';

const statusStyle = (status) => ({ '--status-color': STATUS_COLOR[status] });

export default function StatusSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const select = (status) => {
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

export function StatusBadge({ status, label }) {
  return (
    <span className="status-badge" style={statusStyle(status)}>
      <span className="status-dot" />
      {label && <span className="status-badge__label">{label}</span>}
      <span>{status}</span>
    </span>
  );
}
