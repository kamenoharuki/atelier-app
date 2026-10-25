// X のようなタイムライン（新しい順）。投稿は右下の＋ボタン（NewPostButton）から行う
//   1件ごとに アバター・名前・ユーザーID・日時・本文・リアクション を表示する
import { DEFAULT_AVATAR } from '../../constants';
import { formatRelative } from '../../utils/time';
import Avatar from '../common/Avatar';
import ReactionBar from './ReactionBar';
import './PostFeed.css';

// このアプリには @ID の仕組みが無いので、uid の先頭8文字をユーザーIDとして表示する
const userId = (uid) => `@${uid.slice(0, 8)}`;

export default function PostFeed({ posts, avatars, myUid, onReact }) {
  return (
    <section className="post-feed glass" aria-label="タイムライン">
      {posts.length === 0 ? (
        <p className="post-feed__empty">まだ投稿はありません。右下の＋ボタンから最初のひとことを投稿してみましょう。</p>
      ) : (
        <ol className="post-feed__list">
          {posts.map((post) => (
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
                <p className="post__text">{post.text}</p>
                <ReactionBar
                  reactions={post.reactions}
                  myUid={myUid}
                  onReact={(emoji, mine) => onReact(post.id, emoji, mine)}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
