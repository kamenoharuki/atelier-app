import { useState } from 'react';
import type { Notice, Role } from '../data';
import './NotificationScreen.css';

type SubTab = 'お知らせ' | 'ランキング';

export type RankingRow = {
  id: string;
  name: string;
  count: number;
  isMe: boolean;
};

type Props = {
  role: Role;
  notices: Notice[];
  ranking: RankingRow[];
};

export default function NotificationScreen({ role, notices, ranking }: Props) {
  const [subTab, setSubTab] = useState<SubTab>('お知らせ');

  return (
    <div className="notification-screen">
      <div className="segmented glass" role="tablist">
        {(['お知らせ', 'ランキング'] as SubTab[]).map((tab) => (
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
          {role === 'artist' ? 'あなたを応援してくれているファンのランキングです。' : 'このアトリエの応援ランキングです。'}
        </p>
      )}

      <div className="notification-screen__list">
        {subTab === 'お知らせ'
          ? notices.map((notice) => (
              <div key={notice.id} className="notice-row glass">
                <span className="notice-row__dot" aria-hidden="true" />
                <div className="notice-row__body">
                  <p>{notice.text}</p>
                  <span className="notice-row__time">{notice.time}</span>
                </div>
              </div>
            ))
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
