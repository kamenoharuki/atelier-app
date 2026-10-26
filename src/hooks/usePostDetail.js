// 投稿の詳細画面を開く / 閉じる
//   ブラウザやスマホの「戻る」でも詳細画面を閉じられるように、開くときに履歴を1つ積む
//   閉じたら、タイムラインを開く前のスクロール位置に戻す
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export function usePostDetail(scrollRef) {
  const [openPostId, setOpenPostId] = useState(null);
  const savedScroll = useRef(0);

  // 「戻る」が押されたら閉じる
  useEffect(() => {
    const onPopState = () => setOpenPostId(null);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useLayoutEffect(() => {
    if (openPostId === null && scrollRef.current) scrollRef.current.scrollTop = savedScroll.current;
  }, [openPostId, scrollRef]);

  const openPost = useCallback(
    (postId) => {
      savedScroll.current = scrollRef.current?.scrollTop ?? 0;
      window.history.pushState({ atelierPost: postId }, '');
      setOpenPostId(postId);
    },
    [scrollRef],
  );

  const closePost = useCallback(() => {
    // 開いたときに積んだ履歴を戻す（popstate で閉じる）。履歴が無ければそのまま閉じる
    if (window.history.state?.atelierPost) window.history.back();
    else setOpenPostId(null);
  }, []);

  return { openPostId, openPost, closePost };
}
