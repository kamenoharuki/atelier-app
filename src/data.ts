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
  { id: 'person', label: 'シルエット', gradient: 'linear-gradient(135deg, #3b4a7a, #252c4d)' },
  { id: 'palette', label: 'パレット', gradient: 'linear-gradient(135deg, #5b7be0, #7b5fd6)' },
  { id: 'brush', label: 'ブラシ', gradient: 'linear-gradient(135deg, #4c8fd6, #3c5fb8)' },
  { id: 'star', label: 'スター', gradient: 'linear-gradient(135deg, #8a6fe0, #5a4bb5)' },
  { id: 'moon', label: 'ムーン', gradient: 'linear-gradient(135deg, #36507f, #6a5aa8)' },
  { id: 'heart', label: 'ハート', gradient: 'linear-gradient(135deg, #b0679b, #6e5bc4)' },
];

export type Profile = {
  name: string;
  avatar: Avatar;
};

export const initialProfiles: Record<Role, Profile> = {
  artist: { name: 'namenamename', avatar: { type: 'preset', preset: 'palette' } },
  fan: { name: 'ほしの', avatar: { type: 'preset', preset: 'star' } },
};

export const initialMood = '今日は配色を決める日。夜まで作業します';

export const initialItems: TimelineItem[] = [
  { id: '1', tag: 'TODO', text: '背景のラフを描く', giftCount: 4, done: false },
  { id: '2', tag: '悩み', text: '配色の方向性で迷っている', giftCount: 7, done: false },
  { id: '3', tag: 'TODO', text: '線画を清書する', giftCount: 2, done: true },
  { id: '4', tag: 'TODO', text: '依頼イラストの構図を固める', giftCount: 1, done: false },
  { id: '5', tag: '悩み', text: '新しいペンタブの設定に慣れない', giftCount: 3, done: false },
];

export type Notice = {
  id: string;
  text: string;
  time: string;
};

export const initialNotices: Notice[] = [
  { id: 'n1', text: 'ふぁんさんからタスク「背景のラフを描く」へのアクションがあります', time: '5分前' },
  { id: 'n2', text: 'みるくさんからタスク「線画を清書する」へのアクションがあります', time: '18分前' },
  { id: 'n3', text: 'そらさんから「配色の方向性で迷っている」にコメントがあります', time: '1時間前' },
  { id: 'n4', text: 'あめさんからギフトが届きました', time: '3時間前' },
  { id: 'n5', text: 'くろさんからタスク「線画を清書する」へのアクションがあります', time: '昨日' },
];

export function buildFanNotices(artistName: string, status: ArtistStatus, mood: string): Notice[] {
  return [
    { id: 'f1', text: `${artistName}さんのステータスは「${status}」です`, time: 'たった今' },
    ...(mood ? [{ id: 'f2', text: `${artistName}さんのひとこと：「${mood}」`, time: '10分前' }] : []),
    { id: 'f3', text: `${artistName}さんがタスク「線画を清書する」を完了しました`, time: '1時間前' },
    { id: 'f4', text: '応援ランキングが更新されました', time: '昨日' },
  ];
}

export type RankingEntry = {
  id: string;
  name: string;
  count: number;
};

export const RANKING: RankingEntry[] = [
  { id: 'r1', name: 'ふぁん', count: 42 },
  { id: 'r2', name: 'みるく', count: 31 },
  { id: 'r3', name: 'そら', count: 28 },
  { id: 'r4', name: 'あめ', count: 19 },
  { id: 'r5', name: 'くろ', count: 12 },
];

// ログイン中のファン自身の応援回数の初期値
export const FAN_BASE_SUPPORT = 8;
