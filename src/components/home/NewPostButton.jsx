// 画面右下の丸い＋ボタン（フローティングボタン）と、押すと開く投稿作成ダイアログ
import { useEffect, useRef, useState } from 'react';
import { POST_MAX } from '../../constants';
import Avatar from '../common/Avatar';
import { CloseIcon, PlusIcon } from '../common/icons';
import './NewPostButton.css';

export default function NewPostButton({ me, placeholder, onPost }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="fab" onClick={() => setOpen(true)} aria-label="新しく投稿する" title="投稿する">
        <PlusIcon size={26} />
      </button>
      {open && <ComposerModal me={me} placeholder={placeholder} onPost={onPost} onClose={() => setOpen(false)} />}
    </>
  );
}

function ComposerModal({ me, placeholder, onPost, onClose }) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);
  const text = draft.trim();

  // 開いたらすぐ入力できるように。Esc で閉じる
  useEffect(() => {
    inputRef.current?.focus();
    const onKeyDown = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const submit = () => {
    if (!text) return;
    onPost(text);
    onClose();
  };

  // Ctrl / ⌘ + Enter で投稿（Enter だけなら改行）
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="modal-backdrop" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal composer" role="dialog" aria-modal="true" aria-labelledby="composer-title">
        <div className="modal__header">
          <h2 id="composer-title" className="modal__title">
            投稿する
          </h2>
          <button type="button" className="icon-btn modal__close" onClick={onClose} aria-label="閉じる">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="composer__body">
          <Avatar avatar={me.avatar} size={40} />
          <textarea
            ref={inputRef}
            className="composer__input"
            rows={4}
            maxLength={POST_MAX}
            placeholder={placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="投稿内容"
          />
        </div>

        <div className="composer__footer">
          <span className="composer__count">
            {draft.length} / {POST_MAX}
          </span>
          <button type="button" className="btn btn--primary composer__submit" onClick={submit} disabled={!text}>
            投稿する
          </button>
        </div>
      </div>
    </div>
  );
}
