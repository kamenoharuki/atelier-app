// 通知画面（お知らせ一覧と、ギフトの応援ランキング）
//   コメントのお知らせ（アーティストのみ）は、押すとその投稿の詳細画面が開く
import { useState } from 'react';
import { formatRelative } from '../utils/time';
import './NotificationScreen.css';

export default function NotificationScreen({ role, notices, ranking, onOpenPost }) {
  const [subTab, setSubTab] = useState('お知らせ');

  return (
    <div className="notification-screen">
      <div className="segmented glass" role="tablist">
        {['お知らせ', 'ランキング'].map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={subTab === tab}
            className={`segmented__item ${subTab === tab ? 'is-active' : ''}`}
            onClick={() => setSubTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {subTab === 'ランキング' && (
        <p className="notification-screen__caption">
          {role === 'artist'
            ? 'あなたを応援してくれているファンのランキングです。'
            : 'このアトリエの応援ランキングです。'}
        </p>
      )}

      <div className="notification-screen__list">
        {(subTab === 'お知らせ' ? notices : ranking).length === 0 && (
          <p className="notification-screen__caption">
            {subTab === 'お知らせ' ? 'まだお知らせはありません。' : 'まだ応援してくれたファンはいません。'}
          </p>
        )}
        {subTab === 'お知らせ'
          ? notices.map((notice) => {
              const body = (
                <>
                  <span className="notice-row__dot" aria-hidden="true" />
                  <div className="notice-row__body">
                    <p>{notice.text}</p>
                    <span className="notice-row__time">{formatRelative(notice.createdAt)}</span>
                  </div>
                </>
              );
              return notice.postId ? (
                <button
                  key={notice.id}
                  type="button"
                  className="notice-row notice-row--link glass"
                  onClick={() => onOpenPost(notice.postId)}
                >
                  {body}
                </button>
              ) : (
                <div key={notice.id} className="notice-row glass">
                  {body}
                </div>
              );
            })
          : ranking.map((entry, i) => (
              <div
                key={entry.id}
                className={`rank-row glass ${i < 3 ? `is-top-${i + 1}` : ''} ${entry.isMe ? 'is-me' : ''}`}
              >
                <span className="rank-row__index">{i + 1}</span>
                <span className="rank-row__name">
                  {entry.name}さん
                  {entry.isMe && <span className="rank-row__me">あなた</span>}
                </span>
                <span className="rank-row__count">{entry.count}回</span>
              </div>
            ))}
      </div>
    </div>
  );
}
