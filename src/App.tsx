import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { signOut, updatePassword } from 'firebase/auth';
import type { User } from 'firebase/auth';
import AppHeader from './components/AppHeader';
import ProfileModal from './components/ProfileModal';
import TabBar from './components/TabBar';
import type { Tab } from './components/TabBar';
import Toaster, { useToasts } from './components/Toaster';
import LoginScreen, { AuthLayout } from './screens/LoginScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen, { NoAtelierScreen } from './screens/HomeScreen';
import NotificationScreen from './screens/NotificationScreen';
import type { RankingRow } from './screens/NotificationScreen';
import SettingsScreen from './screens/SettingsScreen';
import type { ArtistNotice, ArtistStatus, Notice, Profile, Tag, UserDoc } from './data';
import { DEFAULT_STATUS } from './data';
import { useAtelier, useAuthUser, useUserDoc } from './hooks/useFirestore';
import * as api from './lib/api';
import { auth, isFirebaseConfigured } from './lib/firebase';
import { errorMessage } from './lib/format';
import './App.css';

export default function App() {
  if (!isFirebaseConfigured) return <SetupScreen />;
  return <AuthGate />;
}

function AuthGate() {
  const { authUser, loading } = useAuthUser();
  const { data: user, loading: userLoading, error: userError } = useUserDoc(authUser?.uid ?? null);

  if (loading || (authUser && userLoading)) {
    return (
      <div className="page">
        <AuthLayout>
          <div className="login__spinner" role="status" aria-label="読み込み中" />
        </AuthLayout>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="page">
        <LoginScreen />
      </div>
    );
  }

  // 読み取りに失敗したときに初回設定へ進むと、既存ユーザーでもプロフィールを作り直そうとしてしまう
  if (userError) {
    return (
      <div className="page">
        <AuthLayout>
          <div className="login__heading">
            <h1 className="login__title">データを読み込めませんでした</h1>
            <p className="login__lead">
              通信状況を確認して再読み込みしてください。解決しない場合は、Firestore のセキュリティルール（firestore.rules）がデプロイされているか確認してください。
            </p>
          </div>
          <button type="button" className="btn btn--primary btn--block" onClick={() => window.location.reload()}>
            再読み込み
          </button>
          <button type="button" className="login__link" onClick={() => signOut(auth)}>
            ログアウト
          </button>
        </AuthLayout>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page">
        <OnboardingScreen uid={authUser.uid} defaultName={authUser.displayName ?? ''} />
      </div>
    );
  }

  return <AtelierApp key={authUser.uid} authUser={authUser} user={user} />;
}

const artistNoticeText = (notice: ArtistNotice) => {
  switch (notice.kind) {
    case 'gift':
      return `${notice.fromName}さんから「${notice.itemText}」にギフトが届きました`;
    case 'cheer':
      return `${notice.fromName}さんから応援メッセージ：「${notice.message}」`;
    case 'join':
      return `${notice.fromName}さんがアトリエに参加しました`;
  }
};

type AtelierAppProps = {
  authUser: User;
  user: UserDoc;
};

function AtelierApp({ authUser, user }: AtelierAppProps) {
  const uid = authUser.uid;
  const role = user.role;
  const atelierId = role === 'artist' ? uid : user.atelierId;

  const { atelier, artist, items, members, notices, updates, loading, feedLoading, denied } = useAtelier(atelierId, role);
  const [tab, setTab] = useState<Tab>('home');
  const [isProfileOpen, setProfileOpen] = useState(false);
  const { toasts, push, dismiss } = useToasts();

  const status: ArtistStatus = atelier?.status ?? DEFAULT_STATUS;
  const mood = atelier?.mood ?? '';
  const artistName = artist?.name ?? '';
  const hasAtelier = Boolean(atelierId) && !denied;

  // アーティストにはファンからの反応、ファンにはアーティストの更新を通知する
  const feed: Notice[] = useMemo(
    () =>
      role === 'artist'
        ? notices.map((n) => ({ id: n.id, text: artistNoticeText(n), createdAt: n.createdAt }))
        : updates.map((u) => ({ id: u.id, text: `${artistName}さんが${u.text}`, createdAt: u.createdAt })),
    [role, notices, updates, artistName],
  );

  // 画面を開いた後に届いた通知をトーストで知らせる
  const knownIds = useRef<{ atelierId: string; ids: Set<string> } | null>(null);
  useEffect(() => {
    if (!atelierId || feedLoading) return;
    if (knownIds.current?.atelierId !== atelierId) {
      knownIds.current = { atelierId, ids: new Set(feed.map((n) => n.id)) };
      return;
    }
    const known = knownIds.current.ids;
    const fresh = feed.filter((n) => !known.has(n.id));
    fresh.forEach((n) => known.add(n.id));
    fresh.reverse().forEach((n) => push(n.text));
  }, [atelierId, feed, feedLoading, push]);

  const lastSeen = user.lastSeenAt?.getTime() ?? 0;
  const unread = feed.filter((n) => n.createdAt.getTime() > lastSeen).length;

  useEffect(() => {
    if (tab === 'notification' && unread > 0) api.markNoticesSeen(uid).catch(() => undefined);
  }, [tab, unread, uid]);

  const run = useCallback(
    (action: Promise<unknown>) => {
      action.catch((e) => push(errorMessage(e), 'error'));
    },
    [push],
  );

  const closeProfile = useCallback(() => setProfileOpen(false), []);
  const loadKey = useCallback(() => api.fetchMyKey(uid), [uid]);

  const logout = () => {
    setProfileOpen(false);
    signOut(auth);
  };

  const saveProfile = async (next: Profile) => {
    await api.saveProfile(uid, user, next);
    setProfileOpen(false);
  };

  const join = async (key: string) => {
    await api.joinAtelier(uid, user, key);
    setTab('home');
  };

  const findItem = (id: string) => items.find((item) => item.id === id);

  const ranking: RankingRow[] = members.map((m) => ({ id: m.id, name: m.name, count: m.giftCount, isMe: m.id === uid }));

  const renderHome = () => {
    if (!atelierId || !hasAtelier) return <NoAtelierScreen denied={denied} onJoin={join} />;
    if (loading) return <div className="login__spinner" role="status" aria-label="読み込み中" />;
    return (
      <HomeScreen
        role={role}
        artistName={artistName}
        status={status}
        mood={mood}
        items={items}
        onPostMood={(text: string) => run(api.postMood(atelierId, text))}
        onAddItem={(tag: Tag, text: string) => run(api.addItem(atelierId, tag, text))}
        onToggleDone={(id: string) => {
          const item = findItem(id);
          if (item) run(api.toggleDone(atelierId, item));
        }}
        onSendGift={(id: string) => {
          const item = findItem(id);
          if (item) run(api.sendGift(atelierId, uid, user.name, item));
        }}
        onSendCheer={(text: string) => run(api.sendCheer(atelierId, uid, user.name, text))}
      />
    );
  };

  return (
    <div className="page">
      <div className="app">
        <AppHeader
          role={role}
          profile={user}
          artistName={hasAtelier ? artistName : undefined}
          status={hasAtelier ? status : undefined}
          onChangeStatus={(next) => atelierId && run(api.setStatus(atelierId, next))}
          onOpenProfile={() => setProfileOpen(true)}
          onLogout={logout}
        />

        <main className="app__content">
          {tab === 'home' && renderHome()}
          {tab === 'notification' && (
            <NotificationScreen role={role} notices={hasAtelier ? feed : []} ranking={hasAtelier ? ranking : []} />
          )}
          {tab === 'settings' && (
            <SettingsScreen
              role={role}
              profile={user}
              email={authUser.email}
              canChangePassword={authUser.providerData.some((p) => p.providerId === 'password')}
              artistName={hasAtelier ? artistName : undefined}
              status={hasAtelier ? status : undefined}
              onEditProfile={() => setProfileOpen(true)}
              onLogout={logout}
              onChangePassword={(password) => updatePassword(authUser, password)}
              onJoin={join}
              onLeave={() => (user.atelierId ? api.leaveAtelier(uid, user.atelierId) : Promise.resolve())}
              onLoadKey={loadKey}
              onChangeKey={(oldKey, newKey) => api.changeKey(uid, oldKey, newKey)}
            />
          )}
        </main>

        <TabBar active={tab} onChange={setTab} badges={{ notification: hasAtelier ? unread : 0 }} />
      </div>

      {isProfileOpen && <ProfileModal profile={user} onSave={saveProfile} onClose={closeProfile} />}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

function SetupScreen() {
  return (
    <div className="page">
      <AuthLayout>
        <div className="login__heading">
          <h1 className="login__title">Firebase の設定が必要です</h1>
          <p className="login__lead">
            プロジェクト直下に <code>.env.local</code> を作成し、Firebase コンソールのウェブアプリ設定の値を入れてから開発サーバーを再起動してください。
          </p>
        </div>
        <code className="login__code">
          {`VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...`}
        </code>
        <p className="login__note">雛形は .env.example にあります。</p>
      </AuthLayout>
    </div>
  );
}
