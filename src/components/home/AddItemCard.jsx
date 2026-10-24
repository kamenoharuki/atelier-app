// アーティストが TODO / 悩み を追加する入力欄
import { useState } from 'react';
import { PlusIcon } from '../common/icons';
import './AddItemCard.css';

const TAGS = ['TODO', '悩み'];

export default function AddItemCard({ onAddItem }) {
  const [newTag, setNewTag] = useState('TODO');
  const [newText, setNewText] = useState('');

  const addItem = () => {
    if (!newText.trim()) return;
    onAddItem(newTag, newText.trim());
    setNewText('');
  };

  return (
    <div className="card glass">
      <div className="card__header">
        <h2 className="card__title">追加する</h2>
        <div className="tag-switch" role="radiogroup" aria-label="種類">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              role="radio"
              aria-checked={newTag === tag}
              className={`tag-switch__option ${newTag === tag ? 'is-active' : ''} ${tag === '悩み' ? 'is-worry' : ''}`}
              onClick={() => setNewTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="card__row">
        <input
          className="input"
          placeholder={newTag === 'TODO' ? '新しいタスクを追加' : '悩みを共有する'}
          maxLength={100}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <button type="button" className="icon-btn icon-btn--primary" onClick={addItem} aria-label="追加">
          <PlusIcon size={18} />
        </button>
      </div>
    </div>
  );
}
