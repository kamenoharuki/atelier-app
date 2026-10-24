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
//   { status: STATUS_OPTIONS のどれか, mood: 最新のひとこと }
//
// TODO・悩み（ateliers/{id}/items）
//   { id, tag: 'TODO' | '悩み', text, giftCount, done }
//
// タイムラインの投稿（ateliers/{id}/posts）
//   { id, uid, name, role, text, createdAt }
//
// 通知
//   アーティスト向け（notices）: { kind: 'gift' | 'post' | 'join' | 'cheer'（旧仕様）, fromName, itemText, message, createdAt }
//   ファン向け（updates）     : { kind: 'status' | 'mood' | 'item' | 'done', text, createdAt }

/* ===== ロール ===== */

export const ROLE_LABEL = {
  artist: 'アーティスト',
  fan: 'ファン',
};

/* ===== アーティストのステータス ===== */

export const STATUS_OPTIONS = [
  { value: 'オンライン', hint: 'ファンからの反応を受け付けています' },
  { value: '制作中', hint: '作業に集中しています' },
  { value: 'アトリエ解放中', hint: 'ファンがアトリエに入室できます' },
  { value: '休憩中', hint: 'ひと休みしています' },
  { value: 'オフライン', hint: '現在は不在です' },
];

// 色は styles/theme.css の --status-* で定義
export const STATUS_COLOR = {
  オンライン: 'var(--status-online)',
  制作中: 'var(--status-working)',
  アトリエ解放中: 'var(--status-open)',
  休憩中: 'var(--status-break)',
  オフライン: 'var(--status-offline)',
};

export const DEFAULT_STATUS = 'オフライン';

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

/* ===== 文字数・桁数 ===== */

// タイムラインの投稿の最大文字数（firestore.rules と合わせる）
export const POST_MAX = 140;

// 鍵番号の桁数（firestore.rules と合わせる）
export const KEY_LENGTH = 12;
