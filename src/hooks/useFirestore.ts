import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { collection, doc, limit, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import type { DocumentData, DocumentReference, FirestoreError, Query, Unsubscribe } from 'firebase/firestore';
import type { ArtistNotice, Atelier, FanUpdate, Member, Role, TimelineItem, UserDoc } from '../data';
import { DEFAULT_AVATAR, DEFAULT_STATUS } from '../data';
import { auth, db } from '../lib/firebase';

const NOTICE_LIMIT = 50;

const toDate = (value: unknown) => (value instanceof Timestamp ? value.toDate() : null);

export function useAuthUser() {
  const [state, setState] = useState<{ authUser: User | null; loading: boolean }>({
    authUser: auth.currentUser,
    loading: true,
  });

  useEffect(() => onAuthStateChanged(auth, (authUser) => setState({ authUser, loading: false })), []);

  return state;
}

type Snapshot<T> = { data: T; loading: boolean; error: boolean };

// アトリエ参加の直後は、サーバー側でメンバーとして扱われるまでに一瞬ずれがあり、
// 最初の購読が permission-denied になることがある。拒否されたら少し待って購読し直す
const RETRY_DELAYS = [1000, 2000, 4000];

function subscribeWithRetry(listen: (onError: (error: FirestoreError) => void) => Unsubscribe, onFail: () => void) {
  let unsubscribe: Unsubscribe = () => undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const start = (attempt: number) => {
    unsubscribe = listen((error) => {
      if (error.code === 'permission-denied' && attempt < RETRY_DELAYS.length) {
        timer = setTimeout(() => start(attempt + 1), RETRY_DELAYS[attempt]);
      } else {
        onFail();
      }
    });
  };
  start(0);
  return () => {
    clearTimeout(timer);
    unsubscribe();
  };
}

// key が変わったときだけ購読し直す（null なら購読しない）
function useDocSnapshot<T>(
  key: string | null,
  ref: () => DocumentReference,
  map: (data: DocumentData) => T,
): Snapshot<T | null> {
  const [state, setState] = useState<Snapshot<T | null> & { key: string | null }>({
    key: null,
    data: null,
    loading: false,
    error: false,
  });

  useEffect(() => {
    if (!key) return;
    setState({ key, data: null, loading: true, error: false });
    return subscribeWithRetry(
      (onError) =>
        onSnapshot(
          ref(),
          (snap) => {
            const data = snap.data({ serverTimestamps: 'estimate' });
            setState({ key, data: data ? map(data) : null, loading: false, error: false });
          },
          onError,
        ),
      () => setState({ key, data: null, loading: false, error: true }),
    );
  }, [key]);

  if (!key) return { data: null, loading: false, error: false };
  // key 切り替え直後の1フレームは前の値を返さない
  if (state.key !== key) return { data: null, loading: true, error: false };
  return state;
}

function useQuerySnapshot<T>(
  key: string | null,
  q: () => Query,
  map: (id: string, data: DocumentData) => T,
): Snapshot<T[]> {
  const [state, setState] = useState<Snapshot<T[]> & { key: string | null }>({
    key: null,
    data: [],
    loading: false,
    error: false,
  });

  useEffect(() => {
    if (!key) return;
    setState({ key, data: [], loading: true, error: false });
    return subscribeWithRetry(
      (onError) =>
        onSnapshot(
          q(),
          (snap) => {
            const data = snap.docs.map((d) => map(d.id, d.data({ serverTimestamps: 'estimate' })));
            setState({ key, data, loading: false, error: false });
          },
          onError,
        ),
      () => setState({ key, data: [], loading: false, error: true }),
    );
  }, [key]);

  if (!key || state.key !== key) return { data: [], loading: Boolean(key), error: false };
  return state;
}

const mapUser = (data: DocumentData): UserDoc => ({
  role: data.role,
  name: data.name ?? '',
  avatar: data.avatar ?? DEFAULT_AVATAR,
  atelierId: data.atelierId ?? null,
  lastSeenAt: toDate(data.lastSeenAt),
});

export function useUserDoc(uid: string | null) {
  return useDocSnapshot(uid, () => doc(db, 'users', uid!), mapUser);
}

// アトリエ1つ分のデータをまとめてリアルタイム購読する
export function useAtelier(atelierId: string | null, role: Role) {
  const atelier = useDocSnapshot<Atelier>(
    atelierId,
    () => doc(db, 'ateliers', atelierId!),
    (data) => ({ status: data.status ?? DEFAULT_STATUS, mood: data.mood ?? '' }),
  );

  const artist = useUserDoc(atelierId);

  const items = useQuerySnapshot<TimelineItem>(
    atelierId,
    () => query(collection(db, 'ateliers', atelierId!, 'items'), orderBy('createdAt', 'desc')),
    (id, data) => ({ id, tag: data.tag, text: data.text, giftCount: data.giftCount ?? 0, done: Boolean(data.done) }),
  );

  const members = useQuerySnapshot<Member>(
    atelierId,
    () => query(collection(db, 'ateliers', atelierId!, 'members'), orderBy('giftCount', 'desc'), limit(NOTICE_LIMIT)),
    (id, data) => ({ id, name: data.name ?? '', avatar: data.avatar ?? DEFAULT_AVATAR, giftCount: data.giftCount ?? 0 }),
  );

  const notices = useQuerySnapshot<ArtistNotice>(
    atelierId && role === 'artist' ? `${atelierId}/notices` : null,
    () => query(collection(db, 'ateliers', atelierId!, 'notices'), orderBy('createdAt', 'desc'), limit(NOTICE_LIMIT)),
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

  const updates = useQuerySnapshot<FanUpdate>(
    atelierId && role === 'fan' ? `${atelierId}/updates` : null,
    () => query(collection(db, 'ateliers', atelierId!, 'updates'), orderBy('createdAt', 'desc'), limit(NOTICE_LIMIT)),
    (id, data) => ({ id, kind: data.kind, text: data.text ?? '', createdAt: toDate(data.createdAt) ?? new Date() }),
  );

  return {
    atelier: atelier.data,
    artist: artist.data,
    items: items.data,
    members: members.data,
    notices: notices.data,
    updates: updates.data,
    loading: atelier.loading || artist.loading || items.loading,
    feedLoading: role === 'artist' ? notices.loading : updates.loading,
    // 閲覧権限がない（アトリエから外された等）
    denied: atelier.error,
  };
}
