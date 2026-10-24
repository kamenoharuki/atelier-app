// Firebase のエラーを、画面に出す日本語メッセージに変える
import { FirebaseError } from 'firebase/app';

// エラーコード → 表示する文
const AUTH_MESSAGES = {
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

export function errorMessage(error, fallback = 'エラーが発生しました。もう一度お試しください') {
  if (error instanceof FirebaseError) return AUTH_MESSAGES[error.code] ?? fallback;
  return fallback;
}

// ポップアップを自分で閉じた場合などはエラー表示しない
export function isCancelled(error) {
  return (
    error instanceof FirebaseError &&
    (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request')
  );
}
