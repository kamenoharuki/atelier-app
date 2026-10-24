// プロフィールとアトリエのデータをリアルタイムで購読する
import { collection, doc, limit, orderBy, query } from 'firebase/firestore';
import { DEFAULT_AVATAR } from '../constants';
import { db } from '../firebase/config';
import { toDate, useDocSnapshot, useQuerySnapshot } from './useSnapshot';

const NOTICE_LIMIT = 50;
const POST_LIMIT = 100;

const mapUser = (data) => ({
  role: data.role,
  name: data.name ?? '',
  avatar: data.avatar ?? DEFAULT_AVATAR,
  atelierId: data.atelierId ?? null,
  lastSeenAt: toDate(data.lastSeenAt),
});

export function useUserDoc(uid) {
  return useDocSnapshot(uid, () => doc(db, 'users', uid), mapUser);
}

// アトリエ1つ分のデータをまとめてリアルタイム購読する
export function useAtelier(atelierId, role) {
  const atelier = useDocSnapshot(
    atelierId,
    () => doc(db, 'ateliers', atelierId),
    (data) => ({
      mood: data.mood ?? '',
      // 旧仕様のステータス「アトリエ解放中」は開放中として扱う
      isOpen: data.isOpen ?? data.status === 'アトリエ解放中',
      online: Boolean(data.online),
      lastActiveAt: toDate(data.lastActiveAt),
    }),
  );

  const artist = useUserDoc(atelierId);

  const items = useQuerySnapshot(
    atelierId,
    () => query(collection(db, 'ateliers', atelierId, 'items'), orderBy('createdAt', 'desc')),
    (id, data) => ({ id, tag: data.tag, text: data.text, giftCount: data.giftCount ?? 0, done: Boolean(data.done) }),
  );

  const members = useQuerySnapshot(
    atelierId,
    () => query(collection(db, 'ateliers', atelierId, 'members'), orderBy('giftCount', 'desc'), limit(NOTICE_LIMIT)),
    (id, data) => ({
      id,
      name: data.name ?? '',
      avatar: data.avatar ?? DEFAULT_AVATAR,
      giftCount: data.giftCount ?? 0,
    }),
  );

  const posts = useQuerySnapshot(
    atelierId ? `${atelierId}/posts` : null,
    () => query(collection(db, 'ateliers', atelierId, 'posts'), orderBy('createdAt', 'desc'), limit(POST_LIMIT)),
    (id, data) => ({
      id,
      uid: data.uid,
      name: data.name ?? '',
      role: data.role,
      text: data.text ?? '',
      createdAt: toDate(data.createdAt) ?? new Date(),
    }),
  );

  const notices = useQuerySnapshot(
    atelierId && role === 'artist' ? `${atelierId}/notices` : null,
    () => query(collection(db, 'ateliers', atelierId, 'notices'), orderBy('createdAt', 'desc'), limit(NOTICE_LIMIT)),
    (id, data) => ({
      id,
      kind: data.kind,
      fromUid: data.fromUid,
      fromName: data.fromName ?? '',
      itemText: data.itemText,
      message: data.message,
      createdAt: toDate(data.createdAt) ?? new Date(),
    }),
  );

  const updates = useQuerySnapshot(
    atelierId && role === 'fan' ? `${atelierId}/updates` : null,
    () => query(collection(db, 'ateliers', atelierId, 'updates'), orderBy('createdAt', 'desc'), limit(NOTICE_LIMIT)),
    (id, data) => ({ id, kind: data.kind, text: data.text ?? '', createdAt: toDate(data.createdAt) ?? new Date() }),
  );

  return {
    atelier: atelier.data,
    artist: artist.data,
    items: items.data,
    members: members.data,
    posts: posts.data,
    notices: notices.data,
    updates: updates.data,
    loading: atelier.loading || artist.loading || items.loading,
    feedLoading: role === 'artist' ? notices.loading : updates.loading,
    // 閲覧権限がない（アトリエから外された等）
    denied: atelier.error,
  };
}
