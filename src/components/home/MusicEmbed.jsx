// 投稿の音楽プレイヤー（Spotify / Apple Music の公式埋め込み）
//   その場で再生・試聴できる。対応していないURLならリンクだけを表示する
import { parseMusicUrl } from '../../utils/music';
import './MusicEmbed.css';

export default function MusicEmbed({ url }) {
  const music = parseMusicUrl(url);

  if (!music) {
    return (
      <a className="music-link" href={url} target="_blank" rel="noopener noreferrer">
        {url}
      </a>
    );
  }

  return (
    <iframe
      className="music-embed"
      src={music.embedUrl}
      height={music.height}
      title={`${music.service} の再生プレイヤー`}
      loading="lazy"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
    />
  );
}
