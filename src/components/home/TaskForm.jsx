// アーティストが TODO / 悩み を追加する入力欄（作成ダイアログの中身）
import { useEffect, useRef, useState } from 'react';

const TAGS = ['TODO', '悩み'];
const TASK_MAX = 100;

export default function TaskForm({ onSubmit }) {
  const [tag, setTag] = useState('TODO');
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);
  const text = draft.trim();

  useEffect(() => inputRef.current?.focus(), []);

  const submit = (e) => {
    e.preventDefault();
    if (text) onSubmit(tag, text);
  };

  return (
    <form className="task-form" onSubmit={submit}>
      <div className="tag-switch" role="radiogroup" aria-label="種類">
        {TAGS.map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={tag === t}
            className={`tag-switch__option ${tag === t ? 'is-active' : ''} ${t === '悩み' ? 'is-worry' : ''}`}
            onClick={() => setTag(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <input
        ref={inputRef}
        className="input"
        placeholder={tag === 'TODO' ? '新しいタスクを追加' : '悩みを共有する'}
        maxLength={TASK_MAX}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <div className="composer__footer">
        <span className="composer__count">
          {draft.length} / {TASK_MAX}
        </span>
        <button type="submit" className="btn btn--primary composer__submit" disabled={!text}>
          追加する
        </button>
      </div>
    </form>
  );
}
