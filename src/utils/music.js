// 音楽URL（Spotify / Apple Music）を判定して、埋め込みプレイヤー用のURLに変える
//   対応していないURLは null を返す（その場合は埋め込みを表示しない）

// Spotify: https://open.spotify.com/track/xxxx（intl-ja/ 付きも可）
const SPOTIFY_TYPES = ['track', 'album', 'playlist', 'episode', 'show', 'artist'];
// Apple Music: https://music.apple.com/jp/album/曲名/123?i=456
const APPLE_TYPES = ['album', 'playlist', 'song', 'station', 'music-video'];

export function parseMusicUrl(input) {
  let url;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  const parts = url.pathname.split('/').filter(Boolean);

  if (url.hostname === 'open.spotify.com') {
    if (parts[0]?.startsWith('intl-')) parts.shift();
    const [type, id] = parts;
    if (!SPOTIFY_TYPES.includes(type) || !/^[A-Za-z0-9]+$/.test(id ?? '')) return null;
    return {
      service: 'Spotify',
      embedUrl: `https://open.spotify.com/embed/${type}/${id}`,
      // 1曲・1話は小さいプレイヤー、アルバムやプレイリストは曲の一覧つき
      height: type === 'track' || type === 'episode' ? 152 : 352,
    };
  }

  if (url.hostname === 'music.apple.com') {
    const [country, type] = parts;
    if (!/^[a-z]{2}$/.test(country ?? '') || !APPLE_TYPES.includes(type) || parts.length < 3) return null;
    // アルバムのURLに ?i=曲番号 が付いていれば、その1曲だけのプレイヤーになる
    const single = type === 'song' || url.searchParams.has('i');
    return {
      service: 'Apple Music',
      embedUrl: `https://embed.music.apple.com${url.pathname}${url.search}`,
      height: single ? 175 : 450,
    };
  }

  return null;
}
