// アバター（プリセットのアイコン or アップロード画像）を丸く表示する
import { AVATAR_PRESETS } from '../../constants';
import { BrushIcon, HeartIcon, MoonIcon, PaletteIcon, PersonIcon, StarIcon } from './icons';
import './Avatar.css';

const GLYPHS = {
  person: PersonIcon,
  palette: PaletteIcon,
  brush: BrushIcon,
  star: StarIcon,
  moon: MoonIcon,
  heart: HeartIcon,
};

export default function Avatar({ avatar, size = 44 }) {
  if (avatar.type === 'image') {
    return (
      <span className="avatar" style={{ width: size, height: size }}>
        <img src={avatar.src} alt="" />
      </span>
    );
  }

  const preset = AVATAR_PRESETS.find((p) => p.id === avatar.preset) ?? AVATAR_PRESETS[0];
  const Glyph = GLYPHS[preset.id];
  return (
    <span className="avatar" style={{ width: size, height: size, background: preset.gradient }}>
      <Glyph size={Math.round(size * 0.48)} color="rgba(255, 255, 255, 0.92)" />
    </span>
  );
}
