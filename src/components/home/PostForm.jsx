// 投稿の入力欄（作成ダイアログの中身）
//   アーティストは 画像の添付 / 解読モード（必要人数） / 期限後のアーカイブ を選べる
import { useEffect, useRef, useState } from 'react';
import { DECODE_GOAL_MAX, POST_LIFETIME_DAYS, POST_MAX } from '../../constants';
import { resizeImageToFit } from '../../utils/image';
import Avatar from '../common/Avatar';
import { CloseIcon, UploadIcon } from '../common/icons';

export default function PostForm({ isArtist, me, placeholder, onSubmit }) {
  const [draft, setDraft] = useState('');
  const [image, setImage] = useState(null);
  const [decode, setDecode] = useState(false);
  const [goal, setGoal] = useState('10');
  const [isArchive, setArchive] = useState(true);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const fileRef = useRef(null);

  const text = draft.trim();
  const goalNumber = Number(goal);
  const goalValid = Number.isInteger(goalNumber) && goalNumber >= 1 && goalNumber <= DECODE_GOAL_MAX;
  const canSubmit = (text || image) && (!decode || goalValid);

  // 開いたらすぐ入力できるように
  useEffect(() => inputRef.current?.focus(), []);

  const pickImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('画像ファイルを選んでください');
    try {
      setImage(await resizeImageToFit(file));
      setError('');
    } catch {
      setError('画像を読み込めませんでした');
    }
  };

  const removeImage = () => {
    setImage(null);
    setDecode(false);
  };

  const submit = () => {
    if (!canSubmit) return;
    onSubmit(text, isArtist ? { image, decodeGoal: decode ? goalNumber : null, isArchive } : {});
  };

  // Ctrl / ⌘ + Enter で投稿（Enter だけなら改行）
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <>
      <div className="composer__body">
        <Avatar avatar={me.avatar} size={40} />
        <div className="composer__main">
          <textarea
            ref={inputRef}
            className="composer__input"
            rows={4}
            maxLength={POST_MAX}
            placeholder={placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="投稿内容"
          />
          {image && (
            <div className="composer__preview">
              <img src={image} alt="添付する画像" />
              <button type="button" className="composer__remove" onClick={removeImage} aria-label="画像を外す">
                <CloseIcon size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {isArtist && (
        <div className="composer__options">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickImage} />
          {!image && (
            <button type="button" className="btn btn--secondary" onClick={() => fileRef.current?.click()}>
              <UploadIcon size={16} />
              画像を添付
            </button>
          )}

          {/* 解読モード：必要人数のリアクションが集まるまで、ファンには画像がモザイクで表示される */}
          <label className={`composer__check ${image ? '' : 'is-disabled'}`}>
            <input type="checkbox" checked={decode} disabled={!image} onChange={(e) => setDecode(e.target.checked)} />
            <span>
              解読モード（モザイク）
              <small>{image ? 'ファンのリアクションが集まるまで画像を隠します' : '画像を添付すると選べます'}</small>
            </span>
          </label>
          {decode && (
            <label className="composer__goal">
              <span>解読に必要な人数</span>
              <input
                type="number"
                className="input"
                inputMode="numeric"
                min={1}
                max={DECODE_GOAL_MAX}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
              <span>人</span>
            </label>
          )}
          {decode && !goalValid && <p className="field__error">1〜{DECODE_GOAL_MAX}人の範囲で入力してください</p>}

          <label className="composer__check">
            <input type="checkbox" checked={isArchive} onChange={(e) => setArchive(e.target.checked)} />
            <span>
              期限後にアーカイブへ入れる
              <small>{POST_LIFETIME_DAYS}日後にタイムラインから消え、ガチャ用のアーカイブに残ります</small>
            </span>
          </label>
        </div>
      )}

      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}

      <div className="composer__footer">
        <span className="composer__count">
          {draft.length} / {POST_MAX}
        </span>
        <button type="button" className="btn btn--primary composer__submit" onClick={submit} disabled={!canSubmit}>
          投稿する
        </button>
      </div>
    </>
  );
}
