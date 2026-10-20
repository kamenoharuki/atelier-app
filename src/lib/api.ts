import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import type { ArtistStatus, Profile, Role, Tag, TimelineItem, UserDoc } from '../data';
import { DEFAULT_STATUS, KEY_LENGTH } from '../data';
import { db } from './firebase';

const userRef = (uid: string) => doc(db, 'users', uid);
const atelierRef = (atelierId: string) => doc(db, 'ateliers', atelierId);
const keyRef = (key: string) => doc(db, 'atelierKeys', key);
const memberRef = (atelierId: string, uid: string) => doc(db, 'ateliers', atelierId, 'members', uid);
const newDocIn = (atelierId: string, name: 'items' | 'notices' | 'updates') => doc(collection(db, 'ateliers', atelierId, name));

export const isValidKey = (key: string) => new RegExp(`^[0-9]{${KEY_LENGTH}}$`).test(key);

export function generateKey() {
  const digits = crypto.getRandomValues(new Uint8Array(KEY_LENGTH));
  return Array.from(digits, (n) => String(n % 10)).join('');
}

/* ===== アカウント ===== */

// 初回ログイン時にプロフィールを作成する。アーティストはアトリエと鍵番号も同時に作る
export async function createUserProfile(uid: string, role: Role, profile: Profile) {
  const batch = writeBatch(db);
  batch.set(userRef(uid), {
    role,
    name: profile.name,
    avatar: profile.avatar,
    atelierId: null,
    lastSeenAt: null,
    createdAt: serverTimestamp(),
  });
  if (role === 'artist') {
    batch.set(atelierRef(uid), { status: DEFAULT_STATUS, mood: '' });
    batch.set(keyRef(generateKey()), { artistUid: uid, createdAt: serverTimestamp() });
  }
  await batch.commit();
}

export async function saveProfile(uid: string, user: UserDoc, profile: Profile) {
  await updateDoc(userRef(uid), { name: profile.name, avatar: profile.avatar });
  // ランキングに表示される名前も揃える（アトリエから外されている場合は無視）
  if (user.role === 'fan' && user.atelierId) {
    await updateDoc(memberRef(user.atelierId, uid), { name: profile.name, avatar: profile.avatar }).catch(() => undefined);
  }
}

export function markNoticesSeen(uid: string) {
  return updateDoc(userRef(uid), { lastSeenAt: serverTimestamp() });
}

/* ===== アーティストの操作 ===== */

export async function setStatus(atelierId: string, status: ArtistStatus) {
  const batch = writeBatch(db);
  batch.update(atelierRef(atelierId), { status });
  batch.set(newDocIn(atelierId, 'updates'), {
    kind: 'status',
    text: `ステータスを「${status}」に変更しました`,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function postMood(atelierId: string, mood: string) {
  const batch = writeBatch(db);
  batch.update(atelierRef(atelierId), { mood });
  batch.set(newDocIn(atelierId, 'updates'), {
    kind: 'mood',
    text: `ひとことを投稿しました：「${mood}」`,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function addItem(atelierId: string, tag: Tag, text: string) {
  const batch = writeBatch(db);
  batch.set(newDocIn(atelierId, 'items'), { tag, text, giftCount: 0, done: false, createdAt: serverTimestamp() });
  batch.set(newDocIn(atelierId, 'updates'), {
    kind: 'item',
    text: `${tag === 'TODO' ? 'タスク' : '悩み'}「${text}」を追加しました`,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function toggleDone(atelierId: string, item: TimelineItem) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'ateliers', atelierId, 'items', item.id), { done: !item.done });
  if (!item.done) {
    batch.set(newDocIn(atelierId, 'updates'), {
      kind: 'done',
      text: `タスク「${item.text}」を完了しました`,
      createdAt: serverTimestamp(),
    });
  }
  await batch.commit();
}

export async function fetchMyKey(artistUid: string) {
  const snap = await getDocs(query(collection(db, 'atelierKeys'), where('artistUid', '==', artistUid)));
  return snap.docs[0]?.id ?? null;
}

export async function changeKey(artistUid: string, oldKey: string | null, newKey: string) {
  const batch = writeBatch(db);
  if (oldKey) batch.delete(keyRef(oldKey));
  batch.set(keyRef(newKey), { artistUid, createdAt: serverTimestamp() });
  await batch.commit();
}

/* ===== ファンの操作 ===== */

export class KeyNotFoundError extends Error {}

export async function joinAtelier(uid: string, user: UserDoc, key: string) {
  const keySnap = await getDoc(keyRef(key));
  if (!keySnap.exists()) throw new KeyNotFoundError();
  const atelierId = keySnap.data().artistUid as string;
  if (user.atelierId === atelierId) return;

  const batch = writeBatch(db);
  if (user.atelierId) batch.delete(memberRef(user.atelierId, uid));
  batch.set(memberRef(atelierId, uid), {
    key,
    name: user.name,
    avatar: user.avatar,
    giftCount: 0,
    joinedAt: serverTimestamp(),
  });
  batch.update(userRef(uid), { atelierId });
  batch.set(newDocIn(atelierId, 'notices'), {
    kind: 'join',
    fromUid: uid,
    fromName: user.name,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function leaveAtelier(uid: string, atelierId: string) {
  const batch = writeBatch(db);
  batch.delete(memberRef(atelierId, uid));
  batch.update(userRef(uid), { atelierId: null });
  await batch.commit();
}

export async function sendGift(atelierId: string, uid: string, fromName: string, item: TimelineItem) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'ateliers', atelierId, 'items', item.id), { giftCount: increment(1) });
  batch.update(memberRef(atelierId, uid), { giftCount: increment(1) });
  batch.set(newDocIn(atelierId, 'notices'), {
    kind: 'gift',
    fromUid: uid,
    fromName,
    itemText: item.text,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function sendCheer(atelierId: string, uid: string, fromName: string, message: string) {
  const batch = writeBatch(db);
  batch.set(newDocIn(atelierId, 'notices'), {
    kind: 'cheer',
    fromUid: uid,
    fromName,
    message,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
}
