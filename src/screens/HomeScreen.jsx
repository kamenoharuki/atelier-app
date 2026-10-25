// ホーム画面（アトリエ）
//   タイムライン → TODO・悩みの一覧（ファンはギフトを贈れる）
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

      {items.length === 0 && (
        <p className="card__empty home-screen__empty">
          {isArtist ? 'まだありません。左下の＋ボタンからTODOや悩みを追加できます。' : 'まだありません。'}
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
