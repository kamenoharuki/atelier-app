// 画面右下に出す通知（トースト）の一覧を管理する
// push(text, 'notice' | 'error') で追加し、一定時間で自動的に消える
import { useCallback, useEffect, useRef, useState } from 'react';

const TOAST_DURATION = 4500;

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const dismiss = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (text, tone = 'notice') => {
      const id = nextId.current++;
      // 最大3件まで表示
      setToasts((prev) => [...prev.slice(-2), { id, text, tone }]);
      timers.current.push(window.setTimeout(() => dismiss(id), TOAST_DURATION));
    },
    [dismiss],
  );

  return { toasts, push, dismiss };
}
