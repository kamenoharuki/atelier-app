// 投稿の詳細画面のコメント（アーティストへの手紙）
//   CommentList: コメントの一覧。ファンには自分が送った分だけ、アーティストには全員分が届く（ファン同士では見えない）
//   CommentBox : 画面の下のコメント入力欄（ファンのみ・1日3回まで。今日あと何回送れるかも表示）
import { useState } from 'react';
import { COMMENT_DAILY_LIMIT, COMMENT_MAX, DEFAULT_AVATAR } from '../../constants';
import { formatRelative } from '../../utils/time';
import Avatar from '../common/Avatar';
import { SendIcon } from '../common/icons';
import './Comments.css';

export function CommentList({ comments, avatars, isArtist }) {
  return (
    <section className="comments" aria-label="コメント">
      <p className="comments__note">
        {isArtist
          ? `ファンからのコメント（${comments.length}件・あなたにだけ見えています）`
          : 'コメントはアーティストにだけ届きます（ほかのファンには見えません）'}
      </p>

      {comments.length === 0 ? (
        <p className="comments__empty">
          {isArtist ? 'まだコメントは届いていません' : 'まだコメントを送っていません。下の入力欄から送れます'}
        </p>
      ) : (
        <ul className="comments__list">
          {comments.map((comment) => (
            <li key={comment.id} className="comment">
              <Avatar avatar={avatars[comment.uid] ?? DEFAULT_AVATAR} size={32} />
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
    </section>
  );
}

export function CommentBox({ remaining, onComment }) {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const text = draft.trim();

  const submit = async (e) => {
    e.preventDefault();
    if (!text || sending || remaining <= 0) return;
    setSending(true);
    // 送れたら入力欄を空にする（失敗したら書いた文は残る）
    if (await onComment(text)) setDraft('');
    setSending(false);
  };

  if (remaining <= 0) {
    return (
      <div className="comment-box">
        <p className="comment-box__limit" role="status">
          本日のコメント上限（{COMMENT_DAILY_LIMIT}回）に達しました
        </p>
      </div>
    );
  }

  return (
    <form className="comment-box" onSubmit={submit}>
      <input
        className="input comment-box__input"
        maxLength={COMMENT_MAX}
        placeholder="コメントを入力..."
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        aria-label="コメントを入力"
      />
      <span className="comment-box__remaining">今日あと{remaining}回</span>
      <button
        type="submit"
        className="btn btn--primary comment-box__send"
        disabled={!text || sending}
        aria-label="コメントを送る"
      >
        <SendIcon size={16} />
      </button>
    </form>
  );
}
