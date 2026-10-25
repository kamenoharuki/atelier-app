// Firestore への書き込み処理をまとめたファイル
// データ構造とアクセス権は firestore.rules に書いてある。ここを変えたらルールも合わせて更新すること
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { KEY_LENGTH, POST_LIFETIME_DAYS, REACTIONS } from '../constants';
import { db } from './config';

const userRef = (uid) => doc(db, 'users', uid);
const atelierRef = (atelierId) => doc(db, 'ateliers', atelierId);
const keyRef = (key) => doc(db, 'atelierKeys', key);
const memberRef = (atelierId, uid) => doc(db, 'ateliers', atelierId, 'members', uid);
const newDocIn = (atelierId, name) => doc(collection(db, 'ateliers', atelierId, name));

export const isValidKey = (key) => new RegExp(`^[0-9]{${KEY_LENGTH}}$`).test(key);

export function generateKey() {
  const digits = crypto.getRandomValues(new Uint8Array(KEY_LENGTH));
  return Array.from(digits, (n) => String(n % 10)).join('');
}

/* ===== アカウント ===== */

// 初回ログイン時にプロフィールを作成する。アーティストはアトリエと鍵番号も同時に作る
export async function createUserProfile(uid, role, profile) {
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
    batch.set(atelierRef(uid), { mood: '', isOpen: false, online: true, lastActiveAt: serverTimestamp() });
    batch.set(keyRef(generateKey()), { artistUid: uid, createdAt: serverTimestamp() });
  }
  await batch.commit();
}

// アーティストのアトリエ（と鍵番号）が無くなっていたら作り直す
// 既にある場合に上書きしないよう、サーバー上の有無をトランザクションで確かめてから作る
export async function restoreAtelier(uid) {
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(atelierRef(uid));
    if (snap.exists()) return;
    tx.set(atelierRef(uid), { mood: '', isOpen: false, online: true, lastActiveAt: serverTimestamp() });
  });
  if (!(await fetchMyKey(uid))) await changeKey(uid, null, generateKey());
}

export async function saveProfile(uid, user, profile) {
  await updateDoc(userRef(uid), { name: profile.name, avatar: profile.avatar });
  // ランキングに表示される名前も揃える（アトリエから外されている場合は無視）
  if (user.role === 'fan' && user.atelierId) {
    await updateDoc(memberRef(user.atelierId, uid), { name: profile.name, avatar: profile.avatar }).catch(
      () => undefined,
    );
  }
}

export function markNoticesSeen(uid) {
  return updateDoc(userRef(uid), { lastSeenAt: serverTimestamp() });
}

/* ===== アーティストの操作 ===== */

// アトリエの開放 / 閉鎖を切り替え、ファンに通知する
export async function setAtelierOpen(atelierId, isOpen) {
  const batch = writeBatch(db);
  batch.update(atelierRef(atelierId), { isOpen });
  batch.set(newDocIn(atelierId, 'updates'), {
    kind: 'status',
    text: isOpen ? 'アトリエを開放しました' : 'アトリエを閉鎖しました',
    createdAt: serverTimestamp(),
  });
  await batch.commit();
}

// オンライン表示の自動更新（hooks/usePresence.js から呼ぶ）
export function updatePresence(atelierId, online) {
  return updateDoc(atelierRef(atelierId), { online, lastActiveAt: serverTimestamp() });
}

export async function addItem(atelierId, tag, text) {
  const batch = writeBatch(db);
  batch.set(newDocIn(atelierId, 'items'), { tag, text, giftCount: 0, done: false, createdAt: serverTimestamp() });
  batch.set(newDocIn(atelierId, 'updates'), {
    kind: 'item',
    text: `${tag === 'TODO' ? 'タスク' : '悩み'}「${text}」を追加しました`,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function toggleDone(atelierId, item) {
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

export async function fetchMyKey(artistUid) {
  const snap = await getDocs(query(collection(db, 'atelierKeys'), where('artistUid', '==', artistUid)));
  return snap.docs[0]?.id ?? null;
}

export async function changeKey(artistUid, oldKey, newKey) {
  const batch = writeBatch(db);
  if (oldKey) batch.delete(keyRef(oldKey));
  batch.set(keyRef(newKey), { artistUid, createdAt: serverTimestamp() });
  await batch.commit();
}

/* ===== ファンの操作 ===== */

export class KeyNotFoundError extends Error {}

export async function joinAtelier(uid, user, key) {
  const keySnap = await getDoc(keyRef(key));
  if (!keySnap.exists()) throw new KeyNotFoundError();
  const atelierId = keySnap.data().artistUid;
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

export async function leaveAtelier(uid, atelierId) {
  const batch = writeBatch(db);
  batch.delete(memberRef(atelierId, uid));
  batch.update(userRef(uid), { atelierId: null });
  await batch.commit();
}

export async function sendGift(atelierId, uid, fromName, item) {
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

/* ===== タイムライン ===== */

// 投稿する。アーティストの投稿はファンへ、ファンの投稿はアーティストへ通知する
//   options（アーティストのみ）: image 画像のデータURL / decodeGoal 解読に必要な人数（解読モード） / isArchive
export async function createPost(atelierId, uid, user, text, options = {}) {
  const { image, decodeGoal, isArchive = false } = options;
  const post = {
    uid,
    name: user.name,
    role: user.role,
    text,
    reactions: {},
    createdAt: serverTimestamp(),
    // 有効期限：作成から7日後（ルールでもこの値になっているか確かめる）
    expiresAt: Timestamp.fromMillis(Date.now() + POST_LIFETIME_DAYS * 24 * 60 * 60 * 1000),
    isArchive,
  };
  if (image) post.image = image;
  if (image && decodeGoal) post.decode = { goal: decodeGoal };

  const batch = writeBatch(db);
  batch.set(newDocIn(atelierId, 'posts'), post);
  const summary = text || (decodeGoal ? '解読モードの画像' : '画像');
  if (user.role === 'artist') {
    if (text) batch.update(atelierRef(atelierId), { mood: text });
    batch.set(newDocIn(atelierId, 'updates'), {
      kind: 'mood',
      text: text ? `ひとことを投稿しました：「${text}」` : `${summary}を投稿しました`,
      createdAt: serverTimestamp(),
    });
  } else {
    batch.set(newDocIn(atelierId, 'notices'), {
      kind: 'post',
      fromUid: uid,
      fromName: user.name,
      message: summary,
      createdAt: serverTimestamp(),
    });
  }
  await batch.commit();
}

// 投稿へのリアクションを付ける / 外す（自分の分だけ書き換える）
//   mine: いま自分が付けている絵文字の一覧
export function toggleReaction(atelierId, postId, uid, emoji, mine) {
  // 以前の選択肢（🎨 💎 など）が残っているとルールで拒否されるので、いまの選択肢だけにしてから書き込む
  const current = mine.filter((e) => REACTIONS.includes(e));
  const next = current.includes(emoji) ? current.filter((e) => e !== emoji) : [...current, emoji];
  return updateDoc(doc(db, 'ateliers', atelierId, 'posts', postId), {
    [`reactions.${uid}`]: next.length > 0 ? next : deleteField(),
  });
}
