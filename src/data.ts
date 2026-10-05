export type Tag = 'TODO' | '悩み';

export type TimelineItem = {
  id: string;
  tag: Tag;
  text: string;
  giftCount: number;
  done: boolean;
};

export type ArtistStatus = '制作中' | '休憩中' | '退室中';

export const STATUS_ORDER: ArtistStatus[] = ['制作中', '休憩中', '退室中'];

export const initialItems: TimelineItem[] = [
  { id: '1', tag: 'TODO', text: '背景のラフを描く', giftCount: 4, done: false },
  { id: '2', tag: '悩み', text: '配色の方向性で迷っている', giftCount: 7, done: false },
  { id: '3', tag: 'TODO', text: '線画を清書する', giftCount: 2, done: true },
  { id: '4', tag: 'TODO', text: '依頼イラストの構図を固める', giftCount: 1, done: false },
  { id: '5', tag: '悩み', text: '新しいペンタブの設定に慣れない', giftCount: 3, done: false },
];
