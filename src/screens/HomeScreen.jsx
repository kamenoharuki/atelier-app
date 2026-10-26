// ホーム画面（アトリエ）
//   タイムライン → TODO・悩みの一覧（ファンはギフトを贈れる）。見出しは付けずにそのまま並べる
//   ※ 投稿・TODOの追加は＋ボタン（AtelierApp で表示する ComposeButton）から行う
//     アーティストは左下（投稿 と TODO・悩み）、ファンは右下（投稿のみ）
import PostFeed from '../components/home/PostFeed';
import TaskCard from '../components/home/TaskCard';
import './HomeScreen.css';

export default function HomeScreen({ role, myUid, posts, avatars, items, onReact, onToggleDone, onSendGift }) {
  const isArtist = role === 'artist';

  const sortedItems = [...items].sort((a, b) => Number(a.done) - Number(b.done));

  return (
    <div className="home-screen">
      <PostFeed posts={posts} avatars={avatars} myUid={myUid} onReact={onReact} />

      {items.length === 0 && (
        <p className="card__empty">
          {isArtist
            ? 'まだTODO・悩みはありません。左下の＋ボタンから追加できます。'
            : 'アーティストのTODO・悩みはまだありません。'}
        </p>
      )}

      <div className="gallery" aria-label="TODO・悩み">
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
