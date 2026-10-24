// ホーム画面（アトリエ）
//   アーティスト: タイムライン → TODO・悩みの追加 → 一覧
//   ファン: アトリエの概要 → タイムライン → TODO・悩みの一覧（ギフトを贈れる）
import AddItemCard from '../components/home/AddItemCard';
import PostFeed from '../components/home/PostFeed';
import TaskCard from '../components/home/TaskCard';
import { OpenBadge, PresenceBadge } from '../components/common/StatusBadge';
import './HomeScreen.css';

export default function HomeScreen({
  role,
  artistName,
  isOpen,
  isOnline,
  me,
  posts,
  avatars,
  items,
  onPost,
  onAddItem,
  onToggleDone,
  onSendGift,
}) {
  const isArtist = role === 'artist';

  const sortedItems = [...items].sort((a, b) => Number(a.done) - Number(b.done));
  const activeCount = items.filter((item) => !item.done).length;
  const giftTotal = items.reduce((sum, item) => sum + item.giftCount, 0);

  return (
    <div className="home-screen">
      {!isArtist && (
        <section className="hero glass">
          <div className="hero__orb" aria-hidden="true" />
          <div className="hero__body">
            <span className="eyebrow">{artistName}さんのアトリエ</span>
            <h1 className="hero__title">Secret Atelier</h1>
            <p className="hero__lead">
              {isOpen
                ? 'ただいまアトリエを開放中です。ギフトや応援を届けましょう。'
                : '招待されたメンバーだけが入れる、閉じた制作空間です。'}
            </p>
            <dl className="hero__stats">
              <div className="hero__stat">
                <dt>ステータス</dt>
                <dd>
                  <OpenBadge isOpen={isOpen} />
                  <PresenceBadge online={isOnline} />
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
      )}

      <div className="section-header">
        <h2 className="section-header__title">タイムライン</h2>
      </div>
      <PostFeed
        me={me}
        posts={posts}
        avatars={avatars}
        placeholder={isArtist ? 'いま何してる？' : `${artistName}さんやファンのみんなに向けて投稿する`}
        onPost={onPost}
      />

      <div className="section-header">
        <h2 className="section-header__title">TODO・悩み</h2>
        <span className="section-header__meta">{items.length}件</span>
      </div>

      {isArtist && <AddItemCard onAddItem={onAddItem} />}

      {items.length === 0 && (
        <p className="card__empty home-screen__empty">
          {isArtist ? 'まだありません。TODOや悩みを追加してみましょう。' : 'まだありません。'}
        </p>
      )}

      <div className="gallery">
        {sortedItems.map((item) => (
          <TaskCard
            key={item.id}
            item={item}
            isArtist={isArtist}
            onToggleDone={() => onToggleDone(item.id)}
            onSendGift={() => onSendGift(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
