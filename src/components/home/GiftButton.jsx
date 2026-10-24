// ファンがタスクにギフトを贈るボタン。押すとハートが飛ぶアニメーションが出る
import { useEffect, useRef, useState } from 'react';
import { GiftIcon, HeartIcon } from '../common/icons';
import './GiftButton.css';

// ギフト送信時に飛び散るパーティクル（角度は度、距離はpx）
const GIFT_PARTICLES = [
  { angle: -90, distance: 46, kind: 'heart' },
  { angle: -140, distance: 38, kind: 'spark' },
  { angle: -40, distance: 38, kind: 'spark' },
  { angle: -115, distance: 52, kind: 'heart' },
  { angle: -65, distance: 52, kind: 'heart' },
  { angle: -170, distance: 30, kind: 'spark' },
  { angle: -10, distance: 30, kind: 'spark' },
];

const BURST_DURATION = 900;

export default function GiftButton({ count, onSend }) {
  const [bursts, setBursts] = useState([]);
  const nextId = useRef(0);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const send = () => {
    onSend();
    const id = nextId.current++;
    setBursts((prev) => [...prev, id]);
    timers.current.push(window.setTimeout(() => setBursts((prev) => prev.filter((b) => b !== id)), BURST_DURATION));
  };

  const lastBurst = bursts[bursts.length - 1];

  return (
    <button type="button" className={`gift-button ${bursts.length ? 'is-sending' : ''}`} onClick={send}>
      <span key={lastBurst ?? 'idle'} className="gift-button__icon">
        <GiftIcon size={15} />
      </span>
      ギフトを贈る
      <span key={count} className="gift-button__count">
        {count}
      </span>
      {bursts.map((id) => (
        <span key={id} className="gift-burst" aria-hidden="true">
          <span className="gift-burst__ring" />
          <span className="gift-burst__plus">+1</span>
          {GIFT_PARTICLES.map((p, i) => {
            const rad = (p.angle * Math.PI) / 180;
            const style = {
              '--dx': `${Math.cos(rad) * p.distance}px`,
              '--dy': `${Math.sin(rad) * p.distance}px`,
              '--delay': `${i * 25}ms`,
            };
            return p.kind === 'heart' ? (
              <span key={i} className="gift-burst__particle gift-burst__particle--heart" style={style}>
                <HeartIcon size={11} />
              </span>
            ) : (
              <span key={i} className="gift-burst__particle gift-burst__particle--spark" style={style} />
            );
          })}
        </span>
      ))}
    </button>
  );
}
