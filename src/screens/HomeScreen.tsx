import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { ArtistStatus, Role, Tag, TimelineItem } from '../data';
import { StatusBadge } from '../components/StatusSelect';
import { SendIcon, PlusIcon, CheckIcon, GiftIcon, HeartIcon } from '../components/icons';
import './HomeScreen.css';

const TAGS: Tag[] = ['TODO', '悩み'];

type Props = {
  role: Role;
  artistName: string;
  status: ArtistStatus;
  mood: string;
  items: TimelineItem[];
  onPostMood: (mood: string) => void;
  onAddItem: (tag: Tag, text: string) => void;
  onToggleDone: (id: string) => void;
  onSendGift: (id: string) => void;
  onSendCheer: (text: string) => void;
};

export default function HomeScreen({
  role,
  artistName,
  status,
  mood,
  items,
  onPostMood,
  onAddItem,
  onToggleDone,
  onSendGift,
  onSendCheer,
}: Props) {
  const isArtist = role === 'artist';

  const sortedItems = [...items].sort((a, b) => Number(a.done) - Number(b.done));
  const activeCount = items.filter((item) => !item.done).length;
  const giftTotal = items.reduce((sum, item) => sum + item.giftCount, 0);

  return (
    <div className="home-screen">
      <section className="hero glass">
        <div className="hero__orb" aria-hidden="true" />
        <div className="hero__body">
          <span className="eyebrow">{isArtist ? 'あなたのアトリエ' : `${artistName}さんのアトリエ`}</span>
          <h1 className="hero__title">Secret Atelier</h1>
          <p className="hero__lead">
            {isArtist
              ? '招待されたファンだけが見られる、あなたの制作スペースです。'
              : status === 'アトリエ解放中'
                ? 'ただいまアトリエを解放中です。ギフトや応援を届けましょう。'
                : '招待されたメンバーだけが入れる、閉じた制作空間です。'}
          </p>
          <dl className="hero__stats">
            <div className="hero__stat">
              <dt>ステータス</dt>
              <dd>
                <StatusBadge status={status} />
              </dd>
            </div>
            <div className="hero__stat">
              <dt>進行中</dt>
              <dd className="hero__number">{activeCount}</dd>
            </div>
            <div className="hero__stat">
              <dt>ギフト</dt>
              <dd className="hero__number">{giftTotal}</dd>
            </div>
          </dl>
        </div>
      </section>

      {isArtist ? <ArtistInputs mood={mood} onPostMood={onPostMood} onAddItem={onAddItem} /> : <FanInputs artistName={artistName} mood={mood} onSendCheer={onSendCheer} />}

      <div className="section-header">
        <h2 className="section-header__title">タイムライン</h2>
        <span className="section-header__meta">{items.length}件</span>
      </div>

      <div className="gallery">
        {sortedItems.map((item) => {
          const isWorry = item.tag === '悩み';
          return (
            <article key={item.id} className={`task-card glass ${item.done ? 'is-done' : ''}`}>
              <div className="task-card__main">
                {item.tag === 'TODO' ? (
                  isArtist ? (
                    <button
                      type="button"
                      className={`check-box ${item.done ? 'is-done' : ''}`}
                      onClick={() => onToggleDone(item.id)}
                      aria-label={item.done ? '未完了に戻す' : '完了にする'}
                    >
                      {item.done && <CheckIcon size={13} />}
                    </button>
                  ) : (
                    <span className={`check-box is-readonly ${item.done ? 'is-done' : ''}`} aria-label={item.done ? '完了' : '未完了'}>
                      {item.done && <CheckIcon size={13} />}
                    </span>
                  )
                ) : (
                  <span className="worry-mark" aria-hidden="true" />
                )}
                <p className="task-card__text">{item.text}</p>
              </div>

              <div className="task-card__footer">
                <span className={`chip ${isWorry ? 'chip--worry' : ''}`}>
                  {item.tag}
                  {item.done && ' · 完了'}
                </span>
                {isArtist ? (
                  <span className="gift-count" aria-label={`ギフト ${item.giftCount}件`}>
                    <GiftIcon size={15} />
                    {item.giftCount}
                  </span>
                ) : (
                  <GiftButton count={item.giftCount} onSend={() => onSendGift(item.id)} />
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

// ギフト送信時に飛び散るパーティクル（角度は度、距離はpx）
const GIFT_PARTICLES = [
  { angle: -90, distance: 46, kind: 'heart' },
  { angle: -140, distance: 38, kind: 'spark' },
  { angle: -40, distance: 38, kind: 'spark' },
  { angle: -115, distance: 52, kind: 'heart' },
  { angle: -65, distance: 52, kind: 'heart' },
  { angle: -170, distance: 30, kind: 'spark' },
  { angle: -10, distance: 30, kind: 'spark' },
] as const;

const BURST_DURATION = 900;

type GiftButtonProps = {
  count: number;
  onSend: () => void;
};

function GiftButton({ count, onSend }: GiftButtonProps) {
  const [bursts, setBursts] = useState<number[]>([]);
  const nextId = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const send = () => {
    onSend();
    const id = nextId.current++;
    setBursts((prev) => [...prev, id]);
    timers.current.push(window.setTimeout(() => setBursts((prev) => prev.filter((b) => b !== id)), BURST_DURATION));
  };

  const lastBurst = bursts[bursts.length - 1];

  return (
    <button type="button" className={`gift-button ${bursts.length ? 'is-sending' : ''}`} onClick={send}>
      <span key={lastBurst ?? 'idle'} className="gift-button__icon">
        <GiftIcon size={15} />
      </span>
      ギフトを贈る
      <span key={count} className="gift-button__count">
        {count}
      </span>

      {bursts.map((id) => (
        <span key={id} className="gift-burst" aria-hidden="true">
          <span className="gift-burst__ring" />
          <span className="gift-burst__plus">+1</span>
          {GIFT_PARTICLES.map((p, i) => {
            const rad = (p.angle * Math.PI) / 180;
            const style = {
              '--dx': `${Math.cos(rad) * p.distance}px`,
              '--dy': `${Math.sin(rad) * p.distance}px`,
              '--delay': `${i * 25}ms`,
            } as CSSProperties;
            return p.kind === 'heart' ? (
              <span key={i} className="gift-burst__particle gift-burst__particle--heart" style={style}>
                <HeartIcon size={11} />
              </span>
            ) : (
              <span key={i} className="gift-burst__particle gift-burst__particle--spark" style={style} />
            );
          })}
        </span>
      ))}
    </button>
  );
}

type ArtistInputsProps = {
  mood: string;
  onPostMood: (mood: string) => void;
  onAddItem: (tag: Tag, text: string) => void;
};

function ArtistInputs({ mood, onPostMood, onAddItem }: ArtistInputsProps) {
  const [moodDraft, setMoodDraft] = useState('');
  const [newTag, setNewTag] = useState<Tag>('TODO');
  const [newText, setNewText] = useState('');

  const postMood = () => {
    if (!moodDraft.trim()) return;
    onPostMood(moodDraft.trim());
    setMoodDraft('');
  };

  const addItem = () => {
    if (!newText.trim()) return;
    onAddItem(newTag, newText.trim());
    setNewText('');
  };

  return (
    <div className="home-screen__inputs">
      <div className="card glass">
        <div className="card__header">
          <h2 className="card__title">ひとこと</h2>
          <span className="card__hint">ファンに表示されます</span>
        </div>
        {mood && <p className="mood-text">「{mood}」</p>}
        <div className="card__row">
          <input
            className="input"
            placeholder="いま何してる？"
            value={moodDraft}
            onChange={(e) => setMoodDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && postMood()}
          />
          <button type="button" className="icon-btn icon-btn--primary" onClick={postMood} aria-label="ひとことを投稿">
            <SendIcon size={17} />
          </button>
        </div>
      </div>

      <div className="card glass">
        <div className="card__header">
          <h2 className="card__title">タイムラインに追加</h2>
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
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
          />
          <button type="button" className="icon-btn icon-btn--primary" onClick={addItem} aria-label="追加">
            <PlusIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

type FanInputsProps = {
  artistName: string;
  mood: string;
  onSendCheer: (text: string) => void;
};

function FanInputs({ artistName, mood, onSendCheer }: FanInputsProps) {
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState(false);

  const send = () => {
    if (!draft.trim()) return;
    onSendCheer(draft.trim());
    setDraft('');
    setSent(true);
  };

  return (
    <div className="home-screen__inputs">
      <div className="card glass">
        <div className="card__header">
          <h2 className="card__title">{artistName}さんのひとこと</h2>
        </div>
        <p className={mood ? 'mood-text' : 'card__empty'}>{mood ? `「${mood}」` : 'まだ投稿はありません'}</p>
      </div>

      <div className="card glass">
        <div className="card__header">
          <h2 className="card__title">応援メッセージ</h2>
          {sent && (
            <span className="card__success" role="status">
              <HeartIcon size={13} /> 送信しました
            </span>
          )}
        </div>
        <div className="card__row">
          <input
            className="input"
            placeholder="制作を応援するひとことを送る"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setSent(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button type="button" className="icon-btn icon-btn--primary" onClick={send} aria-label="応援メッセージを送信">
            <SendIcon size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
