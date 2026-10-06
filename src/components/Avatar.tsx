import type { ComponentType } from 'react';
import type { Avatar as AvatarValue, AvatarPresetId } from '../data';
import { AVATAR_PRESETS } from '../data';
import { BrushIcon, HeartIcon, MoonIcon, PaletteIcon, PersonIcon, StarIcon } from './icons';
import './Avatar.css';

const GLYPHS: Record<AvatarPresetId, ComponentType<{ size?: number; color?: string }>> = {
  person: PersonIcon,
  palette: PaletteIcon,
  brush: BrushIcon,
  star: StarIcon,
  moon: MoonIcon,
  heart: HeartIcon,
};

type Props = {
  avatar: AvatarValue;
  size?: number;
};

export default function Avatar({ avatar, size = 44 }: Props) {
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
