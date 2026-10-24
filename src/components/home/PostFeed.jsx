// X のような投稿欄＋タイムライン
import { useState } from 'react';
import { DEFAULT_AVATAR, POST_MAX } from '../../constants';
import { formatRelative } from '../../utils/time';
import Avatar from '../common/Avatar';
import './PostFeed.css';

export default function PostFeed({ me, posts, avatars, placeholder, onPost }) {
  const [draft, setDraft] = useState('');
  const text = draft.trim();

  const submit = () => {
    if (!text) return;
    onPost(text);
    setDraft('');
  };

  // Ctrl / ⌘ + Enter で投稿（Enter だけなら改行）
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <section className="post-feed glass" aria-label="タイムライン">
      <div className="post-composer">
        <Avatar avatar={me.avatar} size={40} />
        <div className="post-composer__body">
          <textarea
            className="post-composer__input"
            rows={2}
            maxLength={POST_MAX}
            placeholder={placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="投稿内容"
          />
          <div className="post-composer__footer">
            <span className="post-composer__count">
              {draft.length} / {POST_MAX}
            </span>
            <button type="button" className="btn btn--primary post-composer__submit" onClick={submit} disabled={!text}>
              投稿する
            </button>
          </div>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="post-feed__empty">まだ投稿はありません。最初のひとことを投稿してみましょう。</p>
      ) : (
        <ol className="post-feed__list">
          {posts.map((post) => (
            <li key={post.id} className={`post ${post.role === 'artist' ? 'is-artist' : ''}`}>
              <Avatar avatar={avatars[post.uid] ?? DEFAULT_AVATAR} size={40} />
              <div className="post__body">
                <div className="post__meta">
                  <span className="post__name">{post.name}</span>
                  {post.role === 'artist' && <span className="post__badge">アーティスト</span>}
                  <time className="post__time" dateTime={post.createdAt.toISOString()}>
                    · {formatRelative(post.createdAt)}
                  </time>
                </div>
                <p className="post__text">{post.text}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
