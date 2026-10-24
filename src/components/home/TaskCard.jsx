// TODO / 悩み の1件分のカード
//   アーティスト: チェックで完了を切り替え、ギフト数を表示
//   ファン: 完了状態を表示し、ギフトを贈れる
import GiftButton from './GiftButton';
import { CheckIcon, GiftIcon } from '../common/icons';
import './TaskCard.css';

export default function TaskCard({ item, isArtist, onToggleDone, onSendGift }) {
  const isWorry = item.tag === '悩み';
  return (
    <article className={`task-card glass ${item.done ? 'is-done' : ''}`}>
      <div className="task-card__main">
        {item.tag === 'TODO' ? (
          isArtist ? (
            <button
              type="button"
              className={`check-box ${item.done ? 'is-done' : ''}`}
              onClick={onToggleDone}
              aria-label={item.done ? '未完了に戻す' : '完了にする'}
            >
              {item.done && <CheckIcon size={13} />}
            </button>
          ) : (
            <span
              className={`check-box is-readonly ${item.done ? 'is-done' : ''}`}
              aria-label={item.done ? '完了' : '未完了'}
            >
              {item.done && <CheckIcon size={13} />}
            </span>
          )
        ) : (
          <span className="worry-mark" aria-hidden="true" />
        )}
        <p className="task-card__text">{item.text}</p>
      </div>

      <div className="task-card__footer">
        <span className={`chip ${isWorry ? 'chip--worry' : ''}`}>
          {item.tag}
          {item.done && ' · 完了'}
        </span>
        {isArtist ? (
          <span className="gift-count" aria-label={`ギフト ${item.giftCount}件`}>
            <GiftIcon size={15} />
            {item.giftCount}
          </span>
        ) : (
          <GiftButton count={item.giftCount} onSend={onSendGift} />
        )}
      </div>
    </article>
  );
}
