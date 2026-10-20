import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { Avatar as AvatarValue, Profile } from '../data';
import { AVATAR_PRESETS } from '../data';
import { errorMessage, resizeImage } from '../lib/format';
import Avatar from './Avatar';
import { CloseIcon, UploadIcon } from './icons';
import './ProfileModal.css';

const NAME_MAX = 20;
const IMAGE_MAX_BYTES = 10 * 1024 * 1024;

type Props = {
  profile: Profile;
  onSave: (profile: Profile) => Promise<void>;
  onClose: () => void;
};

export default function ProfileModal({ profile, onSave, onClose }: Props) {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState<AvatarValue>(profile.avatar);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください');
      return;
    }
    if (file.size > IMAGE_MAX_BYTES) {
      setError('画像は10MB以下のものを選択してください');
      return;
    }
    resizeImage(file)
      .then((src) => {
        setAvatar({ type: 'image', src });
        setError('');
      })
      .catch(() => setError('画像を読み込めませんでした'));
  };

  const trimmedName = name.trim();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!trimmedName) {
      setError('ユーザーネームを入力してください');
      nameRef.current?.focus();
      return;
    }
    setSaving(true);
    try {
      await onSave({ name: trimmedName, avatar });
    } catch (err) {
      setError(errorMessage(err, '保存できませんでした。もう一度お試しください'));
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        onSubmit={submit}
        noValidate
      >
        <div className="modal__header">
          <h2 id="profile-modal-title" className="modal__title">
            プロフィールを編集
          </h2>
          <button type="button" className="icon-btn modal__close" onClick={onClose} aria-label="閉じる">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="profile-preview">
          <Avatar avatar={avatar} size={72} />
          <div className="profile-preview__text">
            <span className="profile-preview__name">{trimmedName || '未設定'}</span>
            <span className="field__hint">プレビュー</span>
          </div>
        </div>

        <label className="field">
          <span className="field__label">ユーザーネーム</span>
          <input
            ref={nameRef}
            className="input"
            value={name}
            maxLength={NAME_MAX}
            placeholder="表示名を入力"
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
          />
          <span className="field__hint">
            {name.length} / {NAME_MAX}
          </span>
        </label>

        <div className="field">
          <span className="field__label">アイコン</span>
          <div className="avatar-picker">
            {AVATAR_PRESETS.map((preset) => {
              const selected = avatar.type === 'preset' && avatar.preset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`avatar-picker__option ${selected ? 'is-selected' : ''}`}
                  aria-pressed={selected}
                  aria-label={preset.label}
                  title={preset.label}
                  onClick={() => setAvatar({ type: 'preset', preset: preset.id })}
                >
                  <Avatar avatar={{ type: 'preset', preset: preset.id }} size={48} />
                </button>
              );
            })}
            <button
              type="button"
              className={`avatar-picker__option avatar-picker__upload ${avatar.type === 'image' ? 'is-selected' : ''}`}
              aria-pressed={avatar.type === 'image'}
              onClick={() => fileRef.current?.click()}
              title="画像をアップロード"
            >
              {avatar.type === 'image' ? (
                <Avatar avatar={avatar} size={48} />
              ) : (
                <span className="avatar-picker__upload-inner">
                  <UploadIcon size={18} />
                  <span>画像</span>
                </span>
              )}
            </button>
          </div>
          <span className="field__hint">画像はPNG / JPEGなど10MBまで（自動で縮小されます）。アップロード済みの画像を押すと選び直せます。</span>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
        </div>

        {error && (
          <p className="field__error" role="alert">
            {error}
          </p>
        )}

        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            キャンセル
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? '保存中…' : '保存する'}
          </button>
        </div>
      </form>
    </div>
  );
}
