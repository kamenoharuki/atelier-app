// プロフィールとアトリエのデータをリアルタイムで購読する
import { collection, doc, limit, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { DEFAULT_AVATAR, POST_LIFETIME_DAYS } from '../constants';
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

  // タイムラインには作成から7日以内の投稿だけを読み込む（期限切れの投稿はデータとしては残る）
  const posts = useQuerySnapshot(
    atelierId ? `${atelierId}/posts` : null,
    () =>
      query(
        collection(db, 'ateliers', atelierId, 'posts'),
        where('createdAt', '>', Timestamp.fromMillis(Date.now() - POST_LIFETIME_DAYS * 24 * 60 * 60 * 1000)),
        orderBy('createdAt', 'desc'),
        limit(POST_LIMIT),
      ),
    (id, data) => {
      const createdAt = toDate(data.createdAt) ?? new Date();
      return {
        id,
        uid: data.uid,
        name: data.name ?? '',
        role: data.role,
        text: data.text ?? '',
        reactions: data.reactions ?? {},
        image: data.image ?? null,
        decodeGoal: data.decode?.goal ?? null,
        isArchive: Boolean(data.isArchive),
        createdAt,
        // 以前の投稿には expiresAt が無いので、作成日時から計算する
        expiresAt: toDate(data.expiresAt) ?? new Date(createdAt.getTime() + POST_LIFETIME_DAYS * 24 * 60 * 60 * 1000),
      };
    },
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
    // 読み込めたが、アトリエのドキュメント自体が無い
    missing: Boolean(atelierId) && !atelier.loading && !atelier.error && !atelier.data,
  };
}
