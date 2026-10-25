// ホーム画面（アトリエ）
//   アーティスト: タイムライン → TODO・悩みの追加 → 一覧
//   ファン: タイムライン → TODO・悩みの一覧（ギフトを贈れる）
//   ※ 投稿は右下の＋ボタン（AtelierApp で表示する NewPostButton）から行う
import AddItemCard from '../components/home/AddItemCard';
import PostFeed from '../components/home/PostFeed';
import TaskCard from '../components/home/TaskCard';
import './HomeScreen.css';

export default function HomeScreen({
  role,
  myUid,
  posts,
  avatars,
  items,
  onReact,
  onAddItem,
  onToggleDone,
  onSendGift,
}) {
  const isArtist = role === 'artist';

  const sortedItems = [...items].sort((a, b) => Number(a.done) - Number(b.done));

  return (
    <div className="home-screen">
      <div className="home-screen__timeline">
        <div className="section-header">
          <h2 className="section-header__title">タイムライン</h2>
        </div>
        <PostFeed posts={posts} avatars={avatars} myUid={myUid} onReact={onReact} />
      </div>

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
