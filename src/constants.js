// アプリ全体で使う定数
//
// ===== 扱うデータの形（Firestore の構造は firestore.rules の冒頭を参照） =====
//
// ユーザー（users/{uid}）
//   { role: 'artist' | 'fan', name, avatar, atelierId（ファンが参加中のアトリエ。アーティストの uid）, lastSeenAt }
//
// アバター
//   { type: 'preset', preset: 'person' など AVATAR_PRESETS の id } または { type: 'image', src: 画像のデータURL }
//
// アトリエ（ateliers/{アーティストの uid}）
//   { mood: 最新のひとこと, isOpen: 開放中かどうか, online: サイトを開いているか, lastActiveAt: 最後に「まだいる」と記録した時刻 }
//
// TODO・悩み（ateliers/{id}/items）
//   { id, tag: 'TODO' | '悩み', text, giftCount, done }
//
// タイムラインの投稿（ateliers/{id}/posts）
//   { id, uid, name, role, text, createdAt, reactions: { ユーザーのuid: ['❤️', '🔥', ...] },
//     image: 画像のデータURL（アーティストのみ・任意）,
//     decode: { goal: 解読に必要な人数 }（解読モードのときだけ。画像付きの投稿のみ）,
//     expiresAt: 作成から7日後（これを過ぎるとタイムラインに出なくなる）,
//     isArchive: 期限後にガチャのアーカイブへ入れる投稿か（アーティストが選ぶ） }
//
// 通知
//   アーティスト向け（notices）: { kind: 'gift' | 'post' | 'join' | 'cheer'（旧仕様）, fromName, itemText, message, createdAt }
//   ファン向け（updates）     : { kind: 'status' | 'mood' | 'item' | 'done', text, createdAt }

/* ===== ロール ===== */

export const ROLE_LABEL = {
  artist: 'アーティスト',
  fan: 'ファン',
};

/* ===== アーティストの状態（ヘッダー右上などに表示） ===== */

// 色は styles/theme.css の --status-* で定義
export const PRESENCE = {
  online: { label: 'オンライン', color: 'var(--status-online)' },
  offline: { label: 'オフライン', color: 'var(--status-offline)' },
};

export const OPEN_STATE = {
  open: { label: '開放中', color: 'var(--status-open)' },
  closed: { label: '閉鎖中', color: 'var(--status-closed)' },
};

// オンラインの自動記録：アーティストがサイトを開いている間、この間隔で「まだいる」と記録する
export const PRESENCE_HEARTBEAT_MS = 60 * 1000;

/* ===== アバター ===== */

export const AVATAR_PRESETS = [
  { id: 'person', label: 'シルエット', gradient: 'linear-gradient(135deg, #35496f, #1f2b45)' },
  { id: 'palette', label: 'パレット', gradient: 'linear-gradient(135deg, #2f6fd8, #1a4aa3)' },
  { id: 'brush', label: 'ブラシ', gradient: 'linear-gradient(135deg, #3a8fd0, #1f5fa8)' },
  { id: 'star', label: 'スター', gradient: 'linear-gradient(135deg, #5b8fe8, #2c56b8)' },
  { id: 'moon', label: 'ムーン', gradient: 'linear-gradient(135deg, #2b4f8f, #172d5c)' },
  { id: 'heart', label: 'ハート', gradient: 'linear-gradient(135deg, #4a7fd4, #284a96)' },
];

export const DEFAULT_AVATAR = { type: 'preset', preset: 'person' };

/* ===== タイムラインのリアクション ===== */

// 選べる絵文字（firestore.rules の validReactions と同じ並び・文字にすること）
export const REACTIONS = ['❤️', '🔥', '👏', '👍'];

/* ===== 投稿の期限・解読モード ===== */

// 投稿がタイムラインに出ている日数（firestore.rules の expiresAt と合わせる）
export const POST_LIFETIME_DAYS = 7;

// 解読モードで設定できる必要人数の上限（firestore.rules と合わせる）
export const DECODE_GOAL_MAX = 1000;

/* ===== 文字数・桁数 ===== */

// タイムラインの投稿の最大文字数（firestore.rules と合わせる）
export const POST_MAX = 140;

// 鍵番号の桁数（firestore.rules と合わせる）
export const KEY_LENGTH = 12;
