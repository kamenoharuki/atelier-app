// アーティストのオンライン / オフライン表示を自動で切り替える
//   usePresence  : アーティスト本人のブラウザで、サイトを見ている間はオンライン、離れたらオフラインを記録する
//   useIsOnline  : 記録をもとに、いまオンライン表示にするかを判定する（ファン側の表示用）
import { useEffect, useState } from 'react';
import { PRESENCE_HEARTBEAT_MS, PRESENCE_TIMEOUT_MS } from '../constants';
import { updatePresence } from '../firebase/database';

export function usePresence(atelierId) {
  useEffect(() => {
    if (!atelierId) return;
    let timer;
    let online = null;

    const write = (next) => updatePresence(atelierId, next).catch(() => undefined);

    // 画面を開いている間は、定期的に「まだいる」と記録する
    const goOnline = () => {
      clearInterval(timer);
      timer = setInterval(() => write(true), PRESENCE_HEARTBEAT_MS);
      if (online !== true) write(true);
      online = true;
    };

    // タブを閉じた・別のタブに切り替えた
    const goOffline = () => {
      clearInterval(timer);
      if (online !== false) write(false);
      online = false;
    };

    const onVisibilityChange = () => (document.visibilityState === 'visible' ? goOnline() : goOffline());

    if (document.visibilityState === 'visible') goOnline();
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', goOffline);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', goOffline);
    };
  }, [atelierId]);
}

// 閉じたときのオフライン記録は届かないことがあるので、最後の記録が古ければオフライン扱いにする
export function useIsOnline(atelier) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => clearInterval(timer);
  }, []);

  if (!atelier?.online || !atelier.lastActiveAt) return false;
  return now - atelier.lastActiveAt.getTime() < PRESENCE_TIMEOUT_MS;
}
