// 丸い＋ボタン（フローティングボタン）と、押すと開く作成ダイアログ
//   アーティスト: 画面の左下。投稿 と TODO・悩み のどちらも作れる
//   ファン      : 画面の右下。投稿だけ
import { useState } from 'react';
import ComposerModal from './ComposerModal';
import { PlusIcon } from '../common/icons';
import './ComposeButton.css';

export default function ComposeButton({ isArtist, me, placeholder, onPost, onAddItem }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`fab ${isArtist ? 'fab--left' : 'fab--right'}`}
        onClick={() => setOpen(true)}
        aria-label={isArtist ? '投稿・TODOを作成する' : '新しく投稿する'}
        title={isArtist ? '投稿・TODOを作成' : '投稿する'}
      >
        <PlusIcon size={26} />
      </button>
      {open && (
        <ComposerModal
          isArtist={isArtist}
          me={me}
          placeholder={placeholder}
          onPost={onPost}
          onAddItem={onAddItem}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
