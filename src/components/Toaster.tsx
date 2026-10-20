import { useCallback, useEffect, useRef, useState } from 'react';
import { BellIcon, CloseIcon } from './icons';
import './Toaster.css';

const TOAST_DURATION = 4500;

export type Toast = {
  id: number;
  text: string;
  tone: 'notice' | 'error';
};

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const dismiss = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (text: string, tone: Toast['tone'] = 'notice') => {
      const id = nextId.current++;
      // 最大3件まで表示
      setToasts((prev) => [...prev.slice(-2), { id, text, tone }]);
      timers.current.push(window.setTimeout(() => dismiss(id), TOAST_DURATION));
    },
    [dismiss],
  );

  return { toasts, push, dismiss };
}

type Props = {
  toasts: Toast[];
  onDismiss: (id: number) => void;
};

export default function Toaster({ toasts, onDismiss }: Props) {
  return (
    <div className="toaster" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.tone}`} role={toast.tone === 'error' ? 'alert' : 'status'}>
          {toast.tone === 'notice' && (
            <span className="toast__icon" aria-hidden="true">
              <BellIcon size={16} />
            </span>
          )}
          <p className="toast__text">{toast.text}</p>
          <button type="button" className="toast__close" onClick={() => onDismiss(toast.id)} aria-label="閉じる">
            <CloseIcon size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
