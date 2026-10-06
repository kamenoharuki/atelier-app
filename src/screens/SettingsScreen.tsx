import { useState } from 'react';
import type { ArtistStatus, Profile, Role } from '../data';
import { ROLE_LABEL } from '../data';
import Avatar from '../components/Avatar';
import { StatusBadge } from '../components/StatusSelect';
import { LogoutIcon, PencilIcon } from '../components/icons';
import './SettingsScreen.css';

type Props = {
  role: Role;
  profile: Profile;
  artistName: string;
  status: ArtistStatus;
  onEditProfile: () => void;
  onLogout: () => void;
};

export default function SettingsScreen({ role, profile, artistName, status, onEditProfile, onLogout }: Props) {
  const [accountPass, setAccountPass] = useState('');
  const [keyNumber, setKeyNumber] = useState('');

  return (
    <div className="settings-screen">
      <section className="settings-card glass">
        <h2 className="settings-card__title">プロフィール</h2>
        <div className="settings-profile">
          <Avatar avatar={profile.avatar} size={56} />
          <div className="settings-profile__text">
            <span className="settings-profile__name">{profile.name}</span>
            <span className="settings-profile__role">{ROLE_LABEL[role]}としてログイン中</span>
          </div>
          <button type="button" className="btn btn--secondary" onClick={onEditProfile}>
            <PencilIcon size={14} />
            編集
          </button>
        </div>
      </section>

      {role === 'fan' && (
        <section className="settings-card glass">
          <h2 className="settings-card__title">参加中のアトリエ</h2>
          <div className="settings-row">
            <span>{artistName}さんのアトリエ</span>
            <StatusBadge status={status} />
          </div>
        </section>
      )}

      <section className="settings-card glass">
        <h2 className="settings-card__title">アカウントパスワード</h2>
        <label className="field">
          <span className="field__label">新しいパスワード</span>
          <input
            type="password"
            className="input"
            placeholder="8文字以上"
            value={accountPass}
            onChange={(e) => setAccountPass(e.target.value)}
          />
        </label>
        <button type="button" className="btn btn--secondary settings-card__action">
          パスワードを変更する
        </button>
      </section>

      {role === 'artist' && (
        <section className="settings-card glass">
          <h2 className="settings-card__title">アトリエの鍵番号</h2>
          <p className="settings-card__description">ファンをアトリエに招待するときに使う12桁の番号です。</p>
          <label className="field">
            <span className="field__label">新しい鍵番号</span>
            <input
              type="password"
              className="input"
              placeholder="12文字"
              maxLength={12}
              value={keyNumber}
              onChange={(e) => setKeyNumber(e.target.value)}
            />
          </label>
          <button type="button" className="btn btn--secondary settings-card__action">
            鍵番号を変更する
          </button>
        </section>
      )}

      <button type="button" className="btn btn--danger btn--block settings-screen__logout" onClick={onLogout}>
        <LogoutIcon size={17} />
        ログアウト
      </button>
    </div>
  );
}
