// アーティストの投稿の下のコメント欄（アーティストへの手紙）
//   ファン      : 自分が送ったコメントだけが見える。「コメントを入力...」から1日3回まで送れる
//   アーティスト: その投稿に届いたコメントを全員分読める（返信やDMの機能はない）
//   ファン同士のコメントはお互いに見えない
import { useState } from 'react';
import { COMMENT_DAILY_LIMIT, COMMENT_MAX, DEFAULT_AVATAR } from '../../constants';
import { formatRelative } from '../../utils/time';
import Avatar from '../common/Avatar';
import { SendIcon } from '../common/icons';
import './CommentThread.css';

export default function CommentThread({ comments, avatars, isArtist, remaining, onComment }) {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const text = draft.trim();
  const limitReached = remaining <= 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!text || sending || limitReached) return;
    setSending(true);
    // 送れたら入力欄を空にする（失敗したら書いた文は残る）
    if (await onComment(text)) setDraft('');
    setSending(false);
  };

  // アーティストには、コメントが届いている投稿にだけ欄を出す
  if (isArtist && comments.length === 0) return null;

  return (
    <div className="comments">
      <p className="comments__note">
        {isArtist
          ? `ファンからのコメント（${comments.length}件・あなたにだけ見えています）`
          : 'コメントはアーティストにだけ届きます'}
      </p>

      {comments.length > 0 && (
        <ul className="comments__list" aria-label="コメント">
          {comments.map((comment) => (
            <li key={comment.id} className="comment">
              <Avatar avatar={avatars[comment.uid] ?? DEFAULT_AVATAR} size={28} />
              <div className="comment__body">
                <div className="comment__meta">
                  <span className="comment__name">{isArtist ? comment.name : 'あなた'}</span>
                  <time className="comment__time" dateTime={comment.createdAt.toISOString()}>
                    {formatRelative(comment.createdAt)}
                  </time>
                </div>
                <p className="comment__text">{comment.text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!isArtist &&
        (limitReached ? (
          <p className="comments__limit" role="status">
            本日のコメント上限（{COMMENT_DAILY_LIMIT}回）に達しました
          </p>
        ) : (
          <form className="comments__form" onSubmit={submit}>
            <input
              className="input comments__input"
              maxLength={COMMENT_MAX}
              placeholder="コメントを入力..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="コメントを入力"
            />
            <button
              type="submit"
              className="icon-btn comments__send"
              disabled={!text || sending}
              aria-label="コメントを送る"
            >
              <SendIcon size={16} />
            </button>
            <span className="comments__remaining">今日あと{remaining}回</span>
          </form>
        ))}
    </div>
  );
}
