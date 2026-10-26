// プロフィールとアトリエのデータをリアルタイムで購読する
import { useState } from 'react';
import { collection, doc, limit, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { DEFAULT_AVATAR, POST_LIFETIME_DAYS } from '../constants';
import { db } from '../firebase/config';
import { toDate, useDocSnapshot, useQuerySnapshot } from './useSnapshot';

const NOTICE_LIMIT = 50;
const POST_LIMIT = 100;
const POST_PAGE = 50; // アーティストが「さらに読み込む」を押すたびに増やす件数
const COMMENT_LIMIT = 300;

const mapUser = (data) => ({
  role: data.role,
  name: data.name ?? '',
  avatar: data.avatar ?? DEFAULT_AVATAR,
  handle: data.handle ?? null,
  atelierId: data.atelierId ?? null,
  lastSeenAt: toDate(data.lastSeenAt),
});

export function useUserDoc(uid) {
  return useDocSnapshot(uid, () => doc(db, 'users', uid), mapUser);
}

// アトリエ1つ分のデータをまとめてリアルタイム購読する
export function useAtelier(atelierId, role, uid) {
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
      handle: data.handle ?? null,
      giftCount: data.giftCount ?? 0,
    }),
  );

  // タイムラインの投稿
  //   ファン      : 作成から7日以内の投稿だけ（期限切れの投稿はデータとしては残る）
  //   アーティスト: 期限切れも含めた過去の投稿すべて。新しい順に POST_PAGE 件ずつ読み込む
  const isArtist = role === 'artist';
  const [postLimit, setPostLimit] = useState(POST_PAGE);
  const posts = useQuerySnapshot(
    atelierId ? `${atelierId}/posts/${isArtist ? postLimit : 'recent'}` : null,
    () => {
      const ref = collection(db, 'ateliers', atelierId, 'posts');
      if (isArtist) return query(ref, orderBy('createdAt', 'desc'), limit(postLimit));
      return query(
        ref,
        where('createdAt', '>', Timestamp.fromMillis(Date.now() - POST_LIFETIME_DAYS * 24 * 60 * 60 * 1000)),
        orderBy('createdAt', 'desc'),
        limit(POST_LIMIT),
      );
    },
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
        music: data.music ?? null,
        isArchive: Boolean(data.isArchive),
        createdAt,
        // 以前の投稿には expiresAt が無いので、作成日時から計算する
        expiresAt: toDate(data.expiresAt) ?? new Date(createdAt.getTime() + POST_LIFETIME_DAYS * 24 * 60 * 60 * 1000),
      };
    },
    atelierId ? `${atelierId}/posts` : null,
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

  // コメント（アーティストへの手紙）。アーティストは全員分、ファンは自分が書いた分だけ読める
  const comments = useQuerySnapshot(
    atelierId && uid ? `${atelierId}/comments/${role}/${uid}` : null,
    () => {
      const ref = collection(db, 'ateliers', atelierId, 'comments');
      // ファンは「自分の分」と条件を付けないとルールで拒否される（並べ替えは画面側で行う）
      return role === 'artist'
        ? query(ref, orderBy('createdAt', 'desc'), limit(COMMENT_LIMIT))
        : query(ref, where('uid', '==', uid), limit(COMMENT_LIMIT));
    },
    (id, data) => ({
      id,
      uid: data.uid,
      name: data.name ?? '',
      postId: data.postId,
      text: data.text ?? '',
      createdAt: toDate(data.createdAt) ?? new Date(),
    }),
  );

  // 今日のコメント回数（ファンのみ）
  const commentQuota = useDocSnapshot(
    atelierId && uid && role === 'fan' ? `${atelierId}/commentQuota/${uid}` : null,
    () => doc(db, 'ateliers', atelierId, 'commentQuota', uid),
    (data) => ({ day: data.day, count: data.count ?? 0 }),
  );

  return {
    atelier: atelier.data,
    artist: artist.data,
    items: items.data,
    members: members.data,
    posts: posts.data,
    // アーティストだけ：さらに古い投稿があるかもしれない（読み込んだ件数が上限に達している）
    hasMorePosts: isArtist && posts.data.length >= postLimit,
    morePostsLoading: isArtist && posts.loading && posts.data.length > 0,
    loadMorePosts: () => setPostLimit((n) => n + POST_PAGE),
    notices: notices.data,
    updates: updates.data,
    comments: comments.data,
    commentQuota: commentQuota.data,
    loading: atelier.loading || artist.loading || items.loading,
    feedLoading: role === 'artist' ? notices.loading : updates.loading,
    // 閲覧権限がない（アトリエから外された等）
    denied: atelier.error,
    // 読み込めたが、アトリエのドキュメント自体が無い
    missing: Boolean(atelierId) && !atelier.loading && !atelier.error && !atelier.data,
  };
}
