// ホーム画面（アトリエ）
//   タイムライン（横幅いっぱい）→ TODO・悩みの一覧（ファンはギフトを贈れる）。見出しは付けずにそのまま並べる
//   投稿を押すと、その投稿の詳細画面（コメントの一覧と入力欄つき）に切り替わる
//   ※ 投稿・TODOの追加は＋ボタン（AtelierApp で表示する ComposeButton）から行う
//     アーティストは左下（投稿 と TODO・悩み）、ファンは右下（投稿のみ）
import PostDetail from '../components/home/PostDetail';
import PostFeed from '../components/home/PostFeed';
import TaskCard from '../components/home/TaskCard';
import './HomeScreen.css';

export default function HomeScreen({
  role,
  myUid,
  posts,
  avatars,
  handles,
  items,
  comments,
  commentsRemaining,
  openPost,
  hasMorePosts,
  morePostsLoading,
  onLoadMorePosts,
  onOpenPost,
  onClosePost,
  onReact,
  onComment,
  onToggleDone,
  onSendGift,
}) {
  const isArtist = role === 'artist';

  // コメントを投稿ごとに分けて、古い順に並べる（見えるのは、ファンなら自分の分、アーティストなら全員分）
  const commentsByPost = {};
  [...comments].sort((a, b) => a.createdAt - b.createdAt).forEach((c) => (commentsByPost[c.postId] ??= []).push(c));

  if (openPost) {
    return (
      <PostDetail
        post={openPost}
        avatars={avatars}
        handles={handles}
        myUid={myUid}
        isArtist={isArtist}
        comments={commentsByPost[openPost.id] ?? []}
        commentsRemaining={commentsRemaining}
        onBack={onClosePost}
        onReact={(emoji, mine) => onReact(openPost.id, emoji, mine)}
        onComment={(text) => onComment(openPost.id, text)}
      />
    );
  }

  const commentCounts = {};
  Object.entries(commentsByPost).forEach(([postId, list]) => (commentCounts[postId] = list.length));
  const sortedItems = [...items].sort((a, b) => Number(a.done) - Number(b.done));

  return (
    <div className="home-screen">
      <PostFeed
        posts={posts}
        avatars={avatars}
        handles={handles}
        myUid={myUid}
        isArtist={isArtist}
        commentCounts={commentCounts}
        hasMore={hasMorePosts}
        moreLoading={morePostsLoading}
        onLoadMore={onLoadMorePosts}
        onReact={onReact}
        onOpenPost={onOpenPost}
      />

      <div className="home-screen__tasks">
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
    </div>
  );
}
