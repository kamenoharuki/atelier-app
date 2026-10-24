// アーティストの鍵番号（ファンを招待するための12桁の番号）の表示と変更
import { useEffect, useState } from 'react';
import { KEY_LENGTH } from '../../constants';
import { generateKey, isValidKey } from '../../firebase/database';
import { errorMessage } from '../../utils/errors';
import './KeyCard.css';

export default function KeyCard({ onLoadKey, onChangeKey }) {
  const [currentKey, setCurrentKey] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    onLoadKey()
      .then((key) => active && setCurrentKey(key))
      .catch(() => active && setError('鍵番号を読み込めませんでした'))
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, [onLoadKey]);

  const copy = async () => {
    if (!currentKey) return;
    try {
      await navigator.clipboard.writeText(currentKey);
      setMessage('コピーしました');
    } catch {
      setVisible(true);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!isValidKey(draft)) {
      setError(`鍵番号は${KEY_LENGTH}桁の数字にしてください`);
      return;
    }
    if (draft === currentKey) {
      setError('現在の鍵番号と同じです');
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await onChangeKey(currentKey, draft);
      setCurrentKey(draft);
      setDraft('');
      setMessage('鍵番号を変更しました。参加済みのファンはそのまま残ります');
    } catch (err) {
      setError(errorMessage(err, 'この鍵番号は使用できません。別の番号をお試しください'));
    } finally {
      setBusy(false);
    }
  };

  const masked = currentKey ? (visible ? currentKey : '•'.repeat(KEY_LENGTH)) : loaded ? '未設定' : '読み込み中…';

  return (
    <section className="settings-card glass">
      <h2 className="settings-card__title">アトリエの鍵番号</h2>
      <p className="settings-card__description">ファンをアトリエに招待するときに伝える{KEY_LENGTH}桁の番号です。</p>

      <div className="key-display">
        <span className="key-display__value">{masked}</span>
        {currentKey && (
          <>
            <button type="button" className="btn btn--ghost" onClick={() => setVisible((v) => !v)}>
              {visible ? '隠す' : '表示'}
            </button>
            <button type="button" className="btn btn--secondary" onClick={copy}>
              コピー
            </button>
          </>
        )}
      </div>

      <form className="settings-form" onSubmit={submit} noValidate>
        <label className="field">
          <span className="field__label">新しい鍵番号</span>
          <div className="key-input">
            <input
              className="input"
              inputMode="numeric"
              autoComplete="off"
              placeholder={`${KEY_LENGTH}桁の数字`}
              maxLength={KEY_LENGTH}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value.replace(/\D/g, ''));
                if (error) setError('');
              }}
            />
            <button type="button" className="btn btn--ghost" onClick={() => setDraft(generateKey())}>
              自動生成
            </button>
          </div>
        </label>
        {error && (
          <p className="field__error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="settings-form__success" role="status">
            {message}
          </p>
        )}
        <button type="submit" className="btn btn--secondary settings-card__action" disabled={busy}>
          鍵番号を変更する
        </button>
      </form>
    </section>
  );
}
