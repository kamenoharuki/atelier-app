import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { Tag, TimelineItem } from '../data';
import { initialItems } from '../data';
import { SendIcon, PlusIcon, CheckIcon, GiftIcon } from '../components/icons';
import './HomeScreen.css';

const TAGS: Tag[] = ['TODO', '悩み'];

// 作品ごとに異なるホログラム色相を割り当てる
const HUES = [190, 275, 330, 220, 300];

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
  const activeCount = items.filter((item) => !item.done).length;
  const giftTotal = items.reduce((sum, item) => sum + item.giftCount, 0);

  return (
    <div className="home-screen">
      {/* キービジュアル: 秘密のアトリエ */}
      <section className="hero glass">
        <div className="hero__orb" aria-hidden="true">
          <span className="hero__orb-core" />
          <span className="hero__orb-ring" />
          <span className="hero__orb-ring hero__orb-ring--2" />
        </div>
        <div className="hero__body">
          <span className="hud-label hero__access">
            <span className="hero__blink" /> Access granted · invite only
          </span>
          <h1 className="hero__title">
            SECRET <span>ATELIER</span>
          </h1>
          <p className="hero__lead">招待されたメンバーだけが入れる、閉じた制作空間。</p>
          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hud-label">Active</span>
              <strong>{String(activeCount).padStart(2, '0')}</strong>
            </div>
            <div className="hero__stat">
              <span className="hud-label">Gifts</span>
              <strong>{String(giftTotal).padStart(2, '0')}</strong>
            </div>
            <div className="hero__stat">
              <span className="hud-label">Channel</span>
              <strong className="hero__sealed">SEALED</strong>
            </div>
          </div>
        </div>
      </section>

      <div className="home-screen__inputs">
        {/* 1行のつぶやき入力 */}
        <div className="card glass mood-card">
          <span className="hud-label">&gt; broadcast_status</span>
          {mood ? <p className="mood-card__text">「{mood}」</p> : null}
          <div className="mood-card__row">
            <input
              className="mood-card__input"
              placeholder="いま何してる？"
              value={moodDraft}
              onChange={(e) => setMoodDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && postMood()}
            />
            <button type="button" className="icon-button" onClick={postMood} aria-label="つぶやきを送信">
              <SendIcon size={18} color="var(--color-on-neon)" />
            </button>
          </div>
        </div>

        {/* タグ + 新規追加 */}
        <div className="card glass add-card">
          <span className="hud-label">&gt; upload_to_gallery</span>
          <div className="tag-switch">
            {TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`tag-switch__option ${newTag === tag ? 'is-active' : ''} ${tag === '悩み' ? 'is-worry' : ''}`}
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
            <button type="button" className="icon-button icon-button--alt" onClick={addItem} aria-label="追加">
              <PlusIcon size={20} color="#fff" />
            </button>
          </div>
        </div>
      </div>

      {/* TODOタイムライン（デジタルギャラリー） */}
      <div className="section-label">
        <span>タイムライン</span>
        <span className="hud-label">Gallery · {items.length} exhibits</span>
      </div>
      <div className="gallery">
        {sortedItems.map((item, i) => {
          const isWorry = item.tag === '悩み';
          const hue = HUES[Number(item.id) % HUES.length] ?? HUES[0];
          return (
            <article
              key={item.id}
              className={`exhibit glass ${item.done ? 'is-done' : ''} ${isWorry ? 'is-worry' : ''}`}
              style={{ '--hue': hue, '--delay': `${(i % 6) * -0.9}s` } as CSSProperties}
            >
              <div className="exhibit__canvas" aria-hidden="true">
                <span className="exhibit__index">#{String(i + 1).padStart(3, '0')}</span>
                <span className="exhibit__shape" />
              </div>

              <div className="exhibit__body">
                {item.tag === 'TODO' ? (
                  <button
                    type="button"
                    className={`check-circle ${item.done ? 'is-done' : ''}`}
                    onClick={() => toggleDone(item.id)}
                    aria-label={item.done ? '未完了に戻す' : '完了にする'}
                  >
                    {item.done && <CheckIcon size={14} color="var(--color-on-neon)" />}
                  </button>
                ) : (
                  <span className="worry-dot" />
                )}

                <div className="exhibit__text-wrap">
                  <span className={`item-tag ${isWorry ? 'is-worry' : ''}`}>
                    {item.tag}
                    {item.done && <span className="item-tag__state"> // COMPLETE</span>}
                  </span>
                  <p className={`exhibit__text ${item.done ? 'is-done' : ''}`}>{item.text}</p>
                </div>

                <div className="gift-badge">
                  <GiftIcon size={14} color="var(--neon-pink)" />
                  <span>{item.giftCount}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
