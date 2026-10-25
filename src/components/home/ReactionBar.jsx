// 投稿のリアクション欄
//   付いている絵文字を人数つきで並べる（押すと自分の分を付け外し）
//   「＋😊」ボタンで選択肢を開き、好きな絵文字を選んで送れる
import { useEffect, useRef, useState } from 'react';
import { REACTIONS } from '../../constants';
import { PlusIcon, SmileIcon } from '../common/icons';
import './ReactionBar.css';

export default function ReactionBar({ reactions, myUid, onReact }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  // 選択肢の外を押したら閉じる
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const mine = reactions[myUid] ?? [];

  // { uid: ['🔥', ...] } を絵文字ごとの人数にまとめる（REACTIONS の順）
  const counts = REACTIONS.map((emoji) => ({
    emoji,
    count: Object.values(reactions).filter((list) => list.includes(emoji)).length,
  })).filter((r) => r.count > 0);

  const react = (emoji) => {
    onReact(emoji, mine);
    setOpen(false);
  };

  return (
    <div className="reaction-bar" ref={rootRef}>
      {counts.map(({ emoji, count }) => (
        <button
          key={emoji}
          type="button"
          className={`reaction-chip ${mine.includes(emoji) ? 'is-mine' : ''}`}
          onClick={() => onReact(emoji, mine)}
          aria-pressed={mine.includes(emoji)}
          aria-label={`${emoji} ${count}人${mine.includes(emoji) ? '（リアクション済み）' : ''}`}
        >
          <span className="reaction-chip__emoji">{emoji}</span>
          <span className="reaction-chip__count">{count}</span>
        </button>
      ))}

      <button
        type="button"
        className="reaction-add"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="リアクションを追加"
        title="リアクションを追加"
      >
        <PlusIcon size={11} />
        <SmileIcon size={16} />
      </button>

      {open && (
        <div className="reaction-picker" role="menu" aria-label="リアクションを選ぶ">
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              role="menuitem"
              className={`reaction-picker__option ${mine.includes(emoji) ? 'is-mine' : ''}`}
              onClick={() => react(emoji)}
              aria-label={mine.includes(emoji) ? `${emoji} を外す` : `${emoji} を送る`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
