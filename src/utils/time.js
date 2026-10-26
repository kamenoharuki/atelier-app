// 日時を「3分前」「昨日」のような表示に変える

export function formatRelative(date, now = new Date()) {
  const diff = Math.max(0, now.getTime() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'たった今';
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '昨日';
  if (days < 7) return `${days}日前`;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

// 日本時間の「今日」を 20261026 のような数字で返す（コメントの1日の回数を数えるのに使う）
//   firestore.rules の todayJst() と同じ計算にすること
export function todayJst(now = new Date()) {
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.getUTCFullYear() * 10000 + (jst.getUTCMonth() + 1) * 100 + jst.getUTCDate();
}
