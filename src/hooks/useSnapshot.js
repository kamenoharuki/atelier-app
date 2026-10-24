// Firestore のドキュメント／クエリをリアルタイムで購読する汎用フック
// 戻り値はどちらも { data, loading, error }
import { useEffect, useState } from 'react';
import { onSnapshot, Timestamp } from 'firebase/firestore';

// Firestore の Timestamp を Date に変える（まだ無ければ null）
export const toDate = (value) => (value instanceof Timestamp ? value.toDate() : null);

// アトリエ参加の直後は、サーバー側でメンバーとして扱われるまでに一瞬ずれがあり、
// 最初の購読が permission-denied になることがある。拒否されたら少し待って購読し直す
const RETRY_DELAYS = [1000, 2000, 4000];

function subscribeWithRetry(listen, onFail) {
  let unsubscribe = () => undefined;
  let timer;
  const start = (attempt) => {
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
export function useDocSnapshot(key, ref, map) {
  const [state, setState] = useState({
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

export function useQuerySnapshot(key, q, map) {
  const [state, setState] = useState({
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
