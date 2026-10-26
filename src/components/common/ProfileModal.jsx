// 名前・@ユーザーネーム・アバターを編集するダイアログ
//   focus: 開いたときに最初に入力する欄（'name' か 'handle'）
import { useEffect, useRef, useState } from 'react';
import { AVATAR_PRESETS, HANDLE_MAX, HANDLE_PATTERN } from '../../constants';
import { errorMessage } from '../../utils/errors';
import { resizeImage } from '../../utils/image';
import Avatar from './Avatar';
import { CloseIcon, UploadIcon } from './icons';
import './ProfileModal.css';

const NAME_MAX = 20;
const IMAGE_MAX_BYTES = 10 * 1024 * 1024;

export default function ProfileModal({ profile, focus = 'name', onSave, onClose }) {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [handle, setHandle] = useState(profile.handle ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const nameRef = useRef(null);
  const handleRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    (focus === 'handle' ? handleRef : nameRef).current?.focus();
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [focus, onClose]);

  const handleFile = (e) => {
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
  const handleValid = handle === '' || HANDLE_PATTERN.test(handle);

  const submit = async (e) => {
    e.preventDefault();
    if (!trimmedName) {
      setError('名前を入力してください');
      nameRef.current?.focus();
      return;
    }
    if (!handleValid) {
      setError('ユーザーネームは半角英小文字・数字・_ の3〜15文字にしてください');
      return;
    }
    setSaving(true);
    try {
      await onSave({ name: trimmedName, avatar, handle: handle || null });
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
            {handle && <span className="field__hint">@{handle}</span>}
            <span className="field__hint">プレビュー</span>
          </div>
        </div>

        <label className="field">
          <span className="field__label">名前</span>
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

        <label className="field">
          <span className="field__label">ユーザーネーム（@のあと）</span>
          <div className="handle-input">
            <span className="handle-input__at" aria-hidden="true">
              @
            </span>
            <input
              ref={handleRef}
              className="input"
              value={handle}
              maxLength={HANDLE_MAX}
              placeholder="例: atelier_2026"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              onChange={(e) => {
                // 大文字は小文字に、@ は取り除く
                setHandle(e.target.value.toLowerCase().replace(/@/g, ''));
                if (error) setError('');
              }}
            />
          </div>
          <span className={handleValid ? 'field__hint' : 'field__error'}>
            半角英小文字・数字・_ の3〜15文字。ほかの人と同じものは使えません（空欄なら自動のIDを表示）
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
          <span className="field__hint">
            画像はPNG / JPEGなど10MBまで（自動で縮小されます）。アップロード済みの画像を押すと選び直せます。
          </span>
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
