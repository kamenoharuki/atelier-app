// 投稿の詳細画面（X の投稿詳細のように、上に投稿・その下にコメント・画面の下にコメント入力欄）
//   コメントを送れるのは、アーティストの投稿に対するファンだけ（アーティストへの手紙）
import { ArrowLeftIcon } from '../common/icons';
import { CommentBox, CommentList } from './Comments';
import PostCard from './PostCard';
import './PostDetail.css';

export default function PostDetail({
  post,
  avatars,
  handles,
  myUid,
  isArtist,
  comments,
  commentsRemaining,
  onBack,
  onReact,
  onComment,
}) {
  const acceptsComments = post.role === 'artist';

  return (
    <div className="post-detail">
      <div className="post-detail__bar">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="タイムラインに戻る" title="戻る">
          <ArrowLeftIcon size={20} />
        </button>
        <h2 className="post-detail__title">投稿</h2>
      </div>

      <div className="post-detail__scroll">
        <PostCard
          post={post}
          avatar={avatars[post.uid]}
          handle={handles[post.uid]}
          myUid={myUid}
          expired={isArtist && post.expiresAt.getTime() <= Date.now()}
          detail
          onReact={onReact}
        />
        {acceptsComments ? (
          <CommentList comments={comments} avatars={avatars} isArtist={isArtist} />
        ) : (
          <p className="post-detail__note">コメントはアーティストの投稿にだけ送れます</p>
        )}
      </div>

      {acceptsComments && !isArtist && <CommentBox remaining={commentsRemaining} onComment={onComment} />}
    </div>
  );
}
