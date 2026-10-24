// 画面右下の通知（トースト）の表示部分。状態は hooks/useToasts.js で管理する
import { BellIcon, CloseIcon } from './icons';
import './Toaster.css';

export default function Toaster({ toasts, onDismiss }) {
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
