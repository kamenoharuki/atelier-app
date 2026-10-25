// 投稿の画像。解読モードの投稿は、必要人数のリアクション（エール）が集まるまでモザイクで隠す
//   ファン    : 解読前はモザイク＋ゲージ、必要人数に届いたら元の画像
//   投稿者本人: 常に元の画像＋ゲージの進み具合
//   ※ モザイクは画面上の演出。元の画像はデータとしては端末に届いている
import { useEffect, useState } from 'react';
import './DecodeMedia.css';

const MOSAIC_WIDTH = 16; // この幅まで縮めてから引き伸ばすとモザイクになる

export default function DecodeMedia({ image, decodeGoal, reactions, authorUid, myUid }) {
  // 投稿者本人を除いた、リアクションを送った人数
  const supporters = Object.entries(reactions).filter(([uid, list]) => uid !== authorUid && list.length > 0).length;

  if (!decodeGoal) return <img className="post-media" src={image} alt="投稿された画像" loading="lazy" />;

  const unlocked = supporters >= decodeGoal;
  const isAuthor = myUid === authorUid;
  const progress = Math.min(supporters / decodeGoal, 1);
  const remaining = Math.max(decodeGoal - supporters, 0);

  return (
    <div className="decode">
      {unlocked || isAuthor ? (
        <img className="post-media" src={image} alt="投稿された画像" loading="lazy" />
      ) : (
        <Mosaic image={image} remaining={remaining} />
      )}

      <div className="decode__gauge">
        <div className="decode__label">
          <span>{unlocked ? '解読完了' : isAuthor ? 'ファンにはモザイク中' : `あと${remaining}人のエールで解読`}</span>
          <span className="decode__count">
            {Math.min(supporters, decodeGoal)} / {decodeGoal}人
          </span>
        </div>
        <div
          className="decode__bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={decodeGoal}
          aria-valuenow={Math.min(supporters, decodeGoal)}
          aria-label="解読ゲージ"
        >
          <span className={`decode__fill ${unlocked ? 'is-full' : ''}`} style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

// 元の画像を小さく縮めた版だけを表示する（元の画像は画面に出さない）
function Mosaic({ image, remaining }) {
  const [tiny, setTiny] = useState(null);

  useEffect(() => {
    let active = true;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = MOSAIC_WIDTH;
      canvas.height = Math.max(1, Math.round((img.height / img.width) * MOSAIC_WIDTH));
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
      if (active) setTiny({ src: canvas.toDataURL(), ratio: img.width / img.height });
    };
    img.src = image;
    return () => {
      active = false;
    };
  }, [image]);

  return (
    <div className="decode__mosaic" style={{ aspectRatio: tiny ? tiny.ratio : '4 / 3' }}>
      {tiny && <img src={tiny.src} alt="" aria-hidden="true" />}
      <div className="decode__lock">
        <span className="decode__lock-icon" aria-hidden="true">
          🔒
        </span>
        <span>解読中</span>
        <small>リアクションを送ると解読が進みます（あと{remaining}人）</small>
      </div>
    </div>
  );
}
