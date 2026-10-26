// 投稿のリアクション欄
//   ❤️ 🔥 👏 👍 の4つのボタンを並べ、ワンタップで送る（もう一度押すと取り消し）
//   人数は表示せず、自分が送った絵文字だけを強調する
//   ※ アーティスト本人の投稿には表示しない（PostCard で判定）
import { REACTIONS } from '../../constants';
import './ReactionBar.css';

export default function ReactionBar({ reactions, myUid, onReact }) {
  const mine = reactions[myUid] ?? [];

  return (
    <div className="reaction-bar" role="group" aria-label="リアクション">
      {REACTIONS.map((emoji) => {
        const sent = mine.includes(emoji);
        return (
          <button
            key={emoji}
            type="button"
            className={`reaction-button ${sent ? 'is-sent' : ''}`}
            onClick={() => onReact(emoji, mine)}
            aria-pressed={sent}
            aria-label={sent ? `${emoji} を取り消す` : `${emoji} を送る`}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
}
