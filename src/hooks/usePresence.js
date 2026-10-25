// アーティストのオンライン / オフラインを自動で記録する
//   サイトを見ている間はオンライン（1分ごとに「まだいる」と記録）、離れたらオフラインにする
//   ※ いまは画面に表示していない（ファン側の表示はなくした）。ateliers/{uid} の online / lastActiveAt に残る
import { useEffect } from 'react';
import { PRESENCE_HEARTBEAT_MS } from '../constants';
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
