export type Role = 'artist' | 'fan';

export const ROLE_LABEL: Record<Role, string> = {
  artist: 'アーティスト',
  fan: 'ファン',
};

export type Tag = 'TODO' | '悩み';

export type TimelineItem = {
  id: string;
  tag: Tag;
  text: string;
  giftCount: number;
  done: boolean;
};

export type ArtistStatus = 'オンライン' | '制作中' | 'アトリエ解放中' | '休憩中' | 'オフライン';

export const STATUS_OPTIONS: { value: ArtistStatus; hint: string }[] = [
  { value: 'オンライン', hint: 'ファンからの反応を受け付けています' },
  { value: '制作中', hint: '作業に集中しています' },
  { value: 'アトリエ解放中', hint: 'ファンがアトリエに入室できます' },
  { value: '休憩中', hint: 'ひと休みしています' },
  { value: 'オフライン', hint: '現在は不在です' },
];

export const STATUS_COLOR: Record<ArtistStatus, string> = {
  オンライン: 'var(--status-online)',
  制作中: 'var(--status-working)',
  アトリエ解放中: 'var(--status-open)',
  休憩中: 'var(--status-break)',
  オフライン: 'var(--status-offline)',
};

export type AvatarPresetId = 'person' | 'palette' | 'brush' | 'star' | 'moon' | 'heart';

export type Avatar = { type: 'preset'; preset: AvatarPresetId } | { type: 'image'; src: string };

export const AVATAR_PRESETS: { id: AvatarPresetId; label: string; gradient: string }[] = [
  { id: 'person', label: 'シルエット', gradient: 'linear-gradient(135deg, #35496f, #1f2b45)' },
  { id: 'palette', label: 'パレット', gradient: 'linear-gradient(135deg, #2f6fd8, #1a4aa3)' },
  { id: 'brush', label: 'ブラシ', gradient: 'linear-gradient(135deg, #3a8fd0, #1f5fa8)' },
  { id: 'star', label: 'スター', gradient: 'linear-gradient(135deg, #5b8fe8, #2c56b8)' },
  { id: 'moon', label: 'ムーン', gradient: 'linear-gradient(135deg, #2b4f8f, #172d5c)' },
  { id: 'heart', label: 'ハート', gradient: 'linear-gradient(135deg, #4a7fd4, #284a96)' },
];

export type Profile = {
  name: string;
  avatar: Avatar;
};

export const DEFAULT_AVATAR: Avatar = { type: 'preset', preset: 'person' };

export const DEFAULT_STATUS: ArtistStatus = 'オフライン';

// Firestore の users/{uid}
export type UserDoc = Profile & {
  role: Role;
  // ファンが参加中のアトリエ（= アーティストのuid）
  atelierId: string | null;
  lastSeenAt: Date | null;
};

// Firestore の ateliers/{artistUid}
export type Atelier = {
  status: ArtistStatus;
  mood: string;
};

export type Member = Profile & {
  id: string;
  giftCount: number;
};

// ファン → アーティストへの通知
export type ArtistNotice = {
  id: string;
  kind: 'gift' | 'cheer' | 'join';
  fromUid: string;
  fromName: string;
  itemText?: string;
  message?: string;
  createdAt: Date;
};

// アーティスト → ファンへの通知
export type FanUpdate = {
  id: string;
  kind: 'status' | 'mood' | 'item' | 'done';
  text: string;
  createdAt: Date;
};

// 通知画面に表示する1行
export type Notice = {
  id: string;
  text: string;
  createdAt: Date;
};

export const KEY_LENGTH = 12;
