import { useState } from 'react';
import type { Tag, TimelineItem } from '../data';
import { initialItems } from '../data';
import { SendIcon, PlusIcon, CheckIcon, GiftIcon } from '../components/icons';
import './HomeScreen.css';

const TAGS: Tag[] = ['TODO', '悩み'];

export default function HomeScreen() {
  const [mood, setMood] = useState('');
  const [moodDraft, setMoodDraft] = useState('');
  const [items, setItems] = useState<TimelineItem[]>(initialItems);
  const [newTag, setNewTag] = useState<Tag>('TODO');
  const [newText, setNewText] = useState('');

  const postMood = () => {
    if (!moodDraft.trim()) return;
    setMood(moodDraft.trim());
    setMoodDraft('');
  };

  const addItem = () => {
    if (!newText.trim()) return;
    setItems((prev) => [
      { id: Date.now().toString(), tag: newTag, text: newText.trim(), giftCount: 0, done: false },
      ...prev,
    ]);
    setNewText('');
  };

  const toggleDone = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  const sortedItems = [...items].sort((a, b) => Number(a.done) - Number(b.done));

  return (
    <div className="home-screen">
      {/* 1行のつぶやき入力 */}
      <div className="card mood-card">
        {mood ? <p className="mood-card__text">「{mood}」</p> : null}
        <div className="mood-card__row">
          <input
            className="mood-card__input"
            placeholder="いま何してる？"
            value={moodDraft}
            onChange={(e) => setMoodDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && postMood()}
          />
          <button type="button" className="icon-button" onClick={postMood}>
            <SendIcon size={18} color="var(--color-surface)" />
          </button>
        </div>
      </div>

      {/* タグ + 新規追加 */}
      <div className="card add-card">
        <div className="tag-switch">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`tag-switch__option ${newTag === tag ? 'is-active' : ''}`}
              onClick={() => setNewTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="add-card__row">
          <input
            className="add-card__input"
            placeholder={newTag === 'TODO' ? '新しいタスクを追加' : '悩みを共有する'}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
          />
          <button type="button" className="icon-button icon-button--dark" onClick={addItem}>
            <PlusIcon size={20} color="var(--color-surface)" />
          </button>
        </div>
      </div>

      {/* TODOタイムライン */}
      <p className="section-label">タイムライン</p>
      <div className="timeline">
        {sortedItems.map((item) => (
          <div key={item.id} className={`item-card ${item.done ? 'is-done' : ''}`}>
            {item.tag === 'TODO' ? (
              <button
                type="button"
                className={`check-circle ${item.done ? 'is-done' : ''}`}
                onClick={() => toggleDone(item.id)}
              >
                {item.done && <CheckIcon size={14} color="var(--color-surface)" />}
              </button>
            ) : (
              <span className="worry-dot" />
            )}

            <div className="item-card__body">
              <div className="item-card__tag-row">
                <span className={`item-tag ${item.tag === '悩み' ? 'is-worry' : ''}`}>{item.tag}</span>
              </div>
              <p className={`item-card__text ${item.done ? 'is-done' : ''}`}>{item.text}</p>
            </div>

            <div className="gift-badge">
              <GiftIcon size={14} color="var(--color-primary)" />
              <span>{item.giftCount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
