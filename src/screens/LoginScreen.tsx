import type { ReactNode } from 'react';
import type { Role } from '../data';
import { BrushIcon, ChevronRightIcon, HeartIcon } from '../components/icons';
import './LoginScreen.css';

const ROLES: { role: Role; title: string; description: string; icon: ReactNode }[] = [
  {
    role: 'artist',
    title: 'アーティストとしてログイン',
    description: '制作のTODOや悩みを共有し、アトリエのステータスを管理します。',
    icon: <BrushIcon size={22} />,
  },
  {
    role: 'fan',
    title: 'ファンとしてログイン',
    description: 'アトリエをのぞいて、ギフトや応援メッセージを届けます。',
    icon: <HeartIcon size={22} />,
  },
];

type Props = {
  onLogin: (role: Role) => void;
};

export default function LoginScreen({ onLogin }: Props) {
  return (
    <main className="login">
      <div className="login__panel glass">
        <div className="login__brand">
          <span className="login__mark" aria-hidden="true" />
          Secret Atelier
        </div>

        <div className="login__heading">
          <h1 className="login__title">アトリエへようこそ</h1>
          <p className="login__lead">ログインする立場を選んでください。</p>
        </div>

        <div className="login__roles">
          {ROLES.map((item) => (
            <button
              key={item.role}
              type="button"
              className={`role-card role-card--${item.role}`}
              onClick={() => onLogin(item.role)}
            >
              <span className="role-card__icon">{item.icon}</span>
              <span className="role-card__body">
                <span className="role-card__title">{item.title}</span>
                <span className="role-card__description">{item.description}</span>
              </span>
              <ChevronRightIcon />
            </button>
          ))}
        </div>

        <p className="login__note">デモ版のため、パスワードの入力は不要です。</p>
      </div>
    </main>
  );
}
