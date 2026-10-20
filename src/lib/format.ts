import { FirebaseError } from 'firebase/app';

export function formatRelative(date: Date, now = new Date()) {
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

const AUTH_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'メールアドレスの形式が正しくありません',
  'auth/missing-password': 'パスワードを入力してください',
  'auth/weak-password': 'パスワードは6文字以上にしてください',
  'auth/email-already-in-use': 'このメールアドレスは既に登録されています',
  'auth/invalid-credential': 'メールアドレスまたはパスワードが違います',
  'auth/wrong-password': 'メールアドレスまたはパスワードが違います',
  'auth/user-not-found': 'メールアドレスまたはパスワードが違います',
  'auth/too-many-requests': '試行回数が多すぎます。しばらく待ってからお試しください',
  'auth/popup-blocked': 'ポップアップがブロックされました。ブラウザの設定を確認してください',
  'auth/requires-recent-login': 'セキュリティのため、一度ログアウトして再ログインしてからお試しください',
  'auth/network-request-failed': 'ネットワークに接続できません',
  'auth/operation-not-allowed': 'このログイン方法は Firebase で有効になっていません',
  'permission-denied': 'この操作を行う権限がありません',
  unavailable: 'サーバーに接続できません。通信状況を確認してください',
};

export function errorMessage(error: unknown, fallback = 'エラーが発生しました。もう一度お試しください') {
  if (error instanceof FirebaseError) return AUTH_MESSAGES[error.code] ?? fallback;
  return fallback;
}

// ポップアップを自分で閉じた場合などはエラー表示しない
export function isCancelled(error: unknown) {
  return (
    error instanceof FirebaseError &&
    (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request')
  );
}

// アップロード画像を正方形に切り抜き、Firestore に保存できるサイズへ縮小する
export function resizeImage(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      URL.revokeObjectURL(url);
      if (!ctx) return reject(new Error('canvas unavailable'));
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image load failed'));
    };
    img.src = url;
  });
}
