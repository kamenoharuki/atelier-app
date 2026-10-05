import { useState } from 'react';
import './SettingsScreen.css';

export default function SettingsScreen() {
  const [accountKeyPass, setAccountKeyPass] = useState('');
  const [keyNumberPass, setKeyNumberPass] = useState('');

  return (
    <div className="settings-screen">
      <div className="settings-screen__header">
        <span className="settings-screen__name">namenamename</span>
        <button type="button" className="settings-screen__logout">
          ログアウト
        </button>
      </div>

      <div className="settings-card">
        <p className="settings-card__title">アカウントパスワード</p>
        <p className="settings-card__dots">●●●●●●●●●●●●</p>

        <label className="settings-card__label">
          key-password <span className="required">*</span>
        </label>
        <input
          type="password"
          className="settings-card__input"
          placeholder="password"
          value={accountKeyPass}
          onChange={(e) => setAccountKeyPass(e.target.value)}
        />
        <button type="button" className="settings-card__button">
          パスワードを変更する
        </button>
      </div>

      <div className="settings-card">
        <p className="settings-card__title">鍵番号</p>
        <p className="settings-card__dots">●●●●●●●●●●●●</p>

        <label className="settings-card__label">
          key-password <span className="required">*</span>
        </label>
        <input
          type="password"
          className="settings-card__input"
          placeholder="12文字"
          value={keyNumberPass}
          onChange={(e) => setKeyNumberPass(e.target.value)}
        />
        <button type="button" className="settings-card__button">
          鍵番号を変更する
        </button>
      </div>
    </div>
  );
}
