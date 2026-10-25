// 作成ダイアログ。アーティストは上部のタブで「投稿」と「TODO・悩み」を切り替えられる
import { useEffect, useState } from 'react';
import PostForm from './PostForm';
import TaskForm from './TaskForm';
import { CloseIcon } from '../common/icons';
import './Composer.css';

export default function ComposerModal({ isArtist, me, placeholder, onPost, onAddItem, onClose }) {
  const [mode, setMode] = useState('post');

  // Esc で閉じる
  useEffect(() => {
    const onKeyDown = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const done =
    (action) =>
    (...args) => {
      action(...args);
      onClose();
    };

  return (
    <div className="modal-backdrop" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal composer" role="dialog" aria-modal="true" aria-labelledby="composer-title">
        <div className="modal__header">
          <h2 id="composer-title" className="modal__title">
            {mode === 'post' ? '投稿する' : 'TODO・悩みを追加'}
          </h2>
          <button type="button" className="icon-btn modal__close" onClick={onClose} aria-label="閉じる">
            <CloseIcon size={18} />
          </button>
        </div>

        {isArtist && (
          <div className="composer__tabs" role="tablist">
            {[
              ['post', '投稿'],
              ['task', 'TODO・悩み'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={mode === key}
                className={`composer__tab ${mode === key ? 'is-active' : ''}`}
                onClick={() => setMode(key)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {mode === 'post' ? (
          <PostForm isArtist={isArtist} me={me} placeholder={placeholder} onSubmit={done(onPost)} />
        ) : (
          <TaskForm onSubmit={done(onAddItem)} />
        )}
      </div>
    </div>
  );
}
