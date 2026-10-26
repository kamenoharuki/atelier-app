// 投稿の詳細画面（X の投稿詳細のように、上に投稿・その下にコメント・画面の下にコメント入力欄）
//   コメントを送れるのは、アーティストの投稿に対するファンだけ（アーティストへの手紙）
//   右上のゴミ箱ボタンで投稿を削除できる（投稿した本人と、アーティスト）
import { useState } from 'react';
import { ArrowLeftIcon, TrashIcon } from '../common/icons';
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
  onDelete,
}) {
  const acceptsComments = post.role === 'artist';
  const canDelete = isArtist || post.uid === myUid;
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    if (!window.confirm('この投稿を削除しますか？削除すると元に戻せません。')) return;
    setDeleting(true);
    // 成功したら詳細画面は閉じられるので、失敗したときだけボタンを戻す
    if (!(await onDelete())) setDeleting(false);
  };

  return (
    <div className="post-detail">
      <div className="post-detail__bar">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="タイムラインに戻る" title="戻る">
          <ArrowLeftIcon size={20} />
        </button>
        <h2 className="post-detail__title">投稿</h2>
        {canDelete && (
          <button
            type="button"
            className="icon-btn post-detail__delete"
            onClick={remove}
            disabled={deleting}
            aria-label="この投稿を削除する"
            title="削除"
          >
            <TrashIcon size={20} />
          </button>
        )}
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
