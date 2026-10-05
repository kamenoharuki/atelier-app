import { useState } from 'react';
import './NotificationScreen.css';

type SubTab = 'お知らせ' | 'ランキング';

const NOTICES = [
  'ふぁんさんからタスク「背景のラフを描く」へのアクションがあります',
  'みるくさんからタスク「線画を清書する」へのアクションがあります',
  'そらさんから「配色の方向性で迷っている」にコメントがあります',
  'あめさんからギフトが届きました',
  'くろさんからタスク「線画を清書する」へのアクションがあります',
];

const RANKING = [
  { name: 'ふぁんさん', count: '42回' },
  { name: 'みるくさん', count: '31回' },
  { name: 'そらさん', count: '28回' },
  { name: 'あめさん', count: '19回' },
  { name: 'くろさん', count: '12回' },
];

export default function NotificationScreen() {
  const [subTab, setSubTab] = useState<SubTab>('お知らせ');

  return (
    <div className="notification-screen">
      <div className="segmented glass">
        {(['お知らせ', 'ランキング'] as SubTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            className={`segmented__item ${subTab === tab ? 'is-active' : ''}`}
            onClick={() => setSubTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="notification-screen__list">
        {subTab === 'お知らせ'
          ? NOTICES.map((text, i) => (
              <div key={i} className="row glass">
                <span className="row__code">SIG-{String(NOTICES.length - i).padStart(3, '0')}</span>
                <p>{text}</p>
              </div>
            ))
          : RANKING.map((entry, i) => (
              <div key={entry.name} className={`rank-row glass ${i < 3 ? `is-top is-top-${i + 1}` : ''}`}>
                <span className="rank-row__index">{String(i + 1).padStart(2, '0')}</span>
                <span>{entry.name}</span>
                <span className="rank-row__count">{entry.count}</span>
              </div>
            ))}
      </div>
    </div>
  );
}
