// 投稿1件の表示（タイムラインと詳細画面の両方で使う）
//   アバター・名前・@ユーザーネーム・日時・本文・画像（解読モード）・音楽・リアクション
//   タイムラインでは、投稿を押すと詳細画面が開く（リアクションなどのボタンを押したときは開かない）
import { DEFAULT_AVATAR } from '../../constants';
import { formatRelative } from '../../utils/time';
import Avatar from '../common/Avatar';
import { ChatIcon } from '../common/icons';
import DecodeMedia from './DecodeMedia';
import MusicEmbed from './MusicEmbed';
import ReactionBar from './ReactionBar';
import './PostCard.css';

// 詳細画面で出す日時（例: 2026/10/26 14:05）
const formatFull = (date) =>
  date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function PostCard({
  post,
  avatar,
  handle,
  myUid,
  expired,
  commentCount,
  detail = false,
  onReact,
  onOpen,
}) {
  // 投稿のどこを押しても詳細が開くようにする（ボタン・リンク・入力欄・プレイヤーは除く）
  const open = (e) => {
    if (detail || e.target.closest('button, a, input, iframe')) return;
    onOpen();
  };
  const openByKey = (e) => {
    if (!detail && e.target === e.currentTarget && e.key === 'Enter') onOpen();
  };

  return (
    <article
      className={`post ${post.role === 'artist' ? 'is-artist' : ''} ${detail ? 'is-detail' : 'is-link'}`}
      onClick={open}
      onKeyDown={openByKey}
      tabIndex={detail ? undefined : 0}
      aria-label={detail ? undefined : `${post.name}の投稿の詳細を開く`}
    >
      <Avatar avatar={avatar ?? DEFAULT_AVATAR} size={detail ? 48 : 40} />
      <div className="post__body">
        <div className="post__meta">
          <span className="post__name">{post.name}</span>
          {post.role === 'artist' && <span className="post__badge">アーティスト</span>}
          {/* @ユーザーネーム（未設定の人は uid の先頭8文字） */}
          <span className="post__id">@{handle ?? post.uid.slice(0, 8)}</span>
          {!detail && (
            <time className="post__time" dateTime={post.createdAt.toISOString()}>
              · {formatRelative(post.createdAt)}
            </time>
          )}
          {expired && (
            <span className="post__expired" title="ファンのタイムラインには表示されていません">
              期限切れ
            </span>
          )}
        </div>
        {post.text && <p className="post__text">{post.text}</p>}
        {post.image && (
          <DecodeMedia
            image={post.image}
            decodeGoal={post.decodeGoal}
            reactions={post.reactions}
            authorUid={post.uid}
            myUid={myUid}
          />
        )}
        {post.music && <MusicEmbed url={post.music} />}
        {detail && (
          <time className="post__full-time" dateTime={post.createdAt.toISOString()}>
            {formatFull(post.createdAt)}
          </time>
        )}
        <div className="post__actions">
          <ReactionBar reactions={post.reactions} myUid={myUid} onReact={onReact} />
          {/* コメントはアーティストの投稿にだけ付けられる。押すと詳細画面へ */}
          {!detail && post.role === 'artist' && (
            <button type="button" className="post__comments" onClick={onOpen} aria-label="コメントを見る・送る">
              <ChatIcon size={17} />
              {commentCount > 0 && <span>{commentCount}</span>}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
