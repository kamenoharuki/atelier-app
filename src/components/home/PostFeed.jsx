// X のようなタイムライン（新しい順）。投稿は＋ボタン（ComposeButton）から行う
//   1件ごとに アバター・名前・ユーザーID・日時・本文・画像（解読モード）・音楽・リアクション・コメント を表示する
//   コメントはアーティストの投稿だけに付く、アーティストへの手紙（ファン同士では見えない）
//   作成から7日を過ぎた投稿は表示しない
import { COMMENT_DAILY_LIMIT, DEFAULT_AVATAR } from '../../constants';
import { formatRelative, todayJst } from '../../utils/time';
import Avatar from '../common/Avatar';
import CommentThread from './CommentThread';
import DecodeMedia from './DecodeMedia';
import MusicEmbed from './MusicEmbed';
import ReactionBar from './ReactionBar';
import './PostFeed.css';

// このアプリには @ID の仕組みが無いので、uid の先頭8文字をユーザーIDとして表示する
const userId = (uid) => `@${uid.slice(0, 8)}`;

export default function PostFeed({ posts, avatars, myUid, isArtist, comments, commentQuota, onReact, onComment }) {
  // 画面を開いたまま期限が過ぎた投稿も消えるように、表示するときにも期限を確かめる
  const now = Date.now();
  const visible = posts.filter((post) => post.expiresAt.getTime() > now);

  // コメントを投稿ごとに分けて、古い順に並べる
  const commentsByPost = {};
  [...comments].sort((a, b) => a.createdAt - b.createdAt).forEach((c) => (commentsByPost[c.postId] ??= []).push(c));

  // ファンが今日あと何回コメントできるか
  const usedToday = commentQuota?.day === todayJst() ? commentQuota.count : 0;
  const remaining = Math.max(COMMENT_DAILY_LIMIT - usedToday, 0);

  return (
    <section className="post-feed glass" aria-label="タイムライン">
      {visible.length === 0 ? (
        <p className="post-feed__empty">まだ投稿はありません。＋ボタンから最初のひとことを投稿してみましょう。</p>
      ) : (
        <ol className="post-feed__list">
          {visible.map((post) => (
            <li key={post.id} className={`post ${post.role === 'artist' ? 'is-artist' : ''}`}>
              <Avatar avatar={avatars[post.uid] ?? DEFAULT_AVATAR} size={40} />
              <div className="post__body">
                <div className="post__meta">
                  <span className="post__name">{post.name}</span>
                  {post.role === 'artist' && <span className="post__badge">アーティスト</span>}
                  <span className="post__id">{userId(post.uid)}</span>
                  <time className="post__time" dateTime={post.createdAt.toISOString()}>
                    · {formatRelative(post.createdAt)}
                  </time>
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
                <ReactionBar
                  reactions={post.reactions}
                  myUid={myUid}
                  onReact={(emoji, mine) => onReact(post.id, emoji, mine)}
                />
                {/* コメントはアーティストの投稿にだけ付けられる（アーティストへの手紙） */}
                {post.role === 'artist' && (
                  <CommentThread
                    comments={commentsByPost[post.id] ?? []}
                    avatars={avatars}
                    isArtist={isArtist}
                    remaining={remaining}
                    onComment={(text) => onComment(post.id, text)}
                  />
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
