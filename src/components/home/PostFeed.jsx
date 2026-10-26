// X のようなタイムライン（新しい順・横幅いっぱい・投稿どうしは細い線で区切る）。投稿は＋ボタン（ComposeButton）から行う
//   投稿を押すと詳細画面（PostDetail）が開き、コメントはそこから送る
//   作成から7日を過ぎた投稿は、ファンには表示しない。アーティストには「期限切れ」の印を付けて過去の分まで表示する
import PostCard from './PostCard';
import './PostFeed.css';

export default function PostFeed({
  posts,
  avatars,
  handles,
  myUid,
  isArtist,
  commentCounts,
  hasMore,
  moreLoading,
  onLoadMore,
  onReact,
  onOpenPost,
}) {
  // 画面を開いたまま期限が過ぎた投稿も消えるように、表示するときにも期限を確かめる
  const now = Date.now();
  const isExpired = (post) => post.expiresAt.getTime() <= now;
  const visible = isArtist ? posts : posts.filter((post) => !isExpired(post));

  return (
    <section className="post-feed" aria-label="タイムライン">
      {visible.length === 0 ? (
        <p className="post-feed__empty">まだ投稿はありません。＋ボタンから最初のひとことを投稿してみましょう。</p>
      ) : (
        <ol className="post-feed__list">
          {visible.map((post) => (
            <li key={post.id}>
              <PostCard
                post={post}
                avatar={avatars[post.uid]}
                handle={handles[post.uid]}
                myUid={myUid}
                expired={isExpired(post)}
                commentCount={commentCounts[post.id] ?? 0}
                onReact={(emoji, mine) => onReact(post.id, emoji, mine)}
                onOpen={() => onOpenPost(post.id)}
              />
            </li>
          ))}
        </ol>
      )}
      {hasMore && (
        <button type="button" className="post-feed__more" onClick={onLoadMore} disabled={moreLoading}>
          {moreLoading ? '読み込み中…' : 'さらに過去の投稿を読み込む'}
        </button>
      )}
    </section>
  );
}
