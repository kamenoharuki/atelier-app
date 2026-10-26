// ログイン後のメイン画面。アトリエのデータを購読し、タブの切り替えと各操作をまとめる
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { signOut, updatePassword } from 'firebase/auth';
import AppHeader from './components/layout/AppHeader';
import TabBar from './components/layout/TabBar';
import ProfileModal from './components/common/ProfileModal';
import ComposeButton from './components/home/ComposeButton';
import Toaster from './components/common/Toaster';
import HomeScreen from './screens/HomeScreen';
import NoAtelierScreen from './screens/NoAtelierScreen';
import NotificationScreen from './screens/NotificationScreen';
import SettingsScreen from './screens/SettingsScreen';
import { useAtelier } from './hooks/useAtelier';
import { usePresence } from './hooks/usePresence';
import { useToasts } from './hooks/useToasts';
import * as api from './firebase/database';
import { auth } from './firebase/config';
import { errorMessage } from './utils/errors';

// アーティストに届く通知の文面
const artistNoticeText = (notice) => {
  switch (notice.kind) {
    case 'gift':
      return `${notice.fromName}さんから「${notice.itemText}」にギフトが届きました`;
    case 'cheer':
      return `${notice.fromName}さんから応援メッセージ：「${notice.message}」`;
    case 'post':
      return `${notice.fromName}さんがタイムラインに投稿しました：「${notice.message}」`;
    case 'join':
      return `${notice.fromName}さんがアトリエに参加しました`;
  }
};

export default function AtelierApp({ authUser, user }) {
  const uid = authUser.uid;
  const role = user.role;
  const atelierId = role === 'artist' ? uid : user.atelierId;

  const {
    atelier,
    artist,
    items,
    members,
    posts,
    notices,
    updates,
    comments,
    commentQuota,
    loading,
    feedLoading,
    denied,
    missing,
  } = useAtelier(atelierId, role, uid);
  const [tab, setTab] = useState('home');
  const [isProfileOpen, setProfileOpen] = useState(false);
  const { toasts, push, dismiss } = useToasts();

  const isOpen = Boolean(atelier?.isOpen);
  // アーティスト本人は、見ている時点でオンライン
  usePresence(role === 'artist' ? uid : null);

  // アーティストのアトリエが消えていたら作り直す（無いままだと開放の切り替えなどが権限エラーになる）
  useEffect(() => {
    if (role === 'artist' && missing) api.restoreAtelier(uid).catch(() => undefined);
  }, [role, missing, uid]);
  const artistName = artist?.name ?? '';
  const hasAtelier = Boolean(atelierId) && !denied;

  // アーティストにはファンからの反応、ファンにはアーティストの更新を通知する
  const feed = useMemo(
    () =>
      role === 'artist'
        ? notices.map((n) => ({ id: n.id, text: artistNoticeText(n), createdAt: n.createdAt }))
        : updates.map((u) => ({ id: u.id, text: `${artistName}さんが${u.text}`, createdAt: u.createdAt })),
    [role, notices, updates, artistName],
  );

  // 画面を開いた後に届いた通知をトーストで知らせる
  const knownIds = useRef(null);
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
    (action) => {
      action.catch((e) => push(errorMessage(e), 'error'));
    },
    [push],
  );

  // run と同じだが、成功したかどうか（true / false）を返す
  const tryRun = (action) =>
    action.then(
      () => true,
      (e) => {
        push(errorMessage(e), 'error');
        return false;
      },
    );

  const closeProfile = useCallback(() => setProfileOpen(false), []);
  const loadKey = useCallback(() => api.fetchMyKey(uid), [uid]);

  const logout = async () => {
    setProfileOpen(false);
    // ログアウト後は書き込めないので、先にオフラインを記録する
    if (role === 'artist') await api.updatePresence(uid, false).catch(() => undefined);
    signOut(auth);
  };

  const saveProfile = async (next) => {
    await api.saveProfile(uid, user, next);
    setProfileOpen(false);
  };

  const join = async (key) => {
    await api.joinAtelier(uid, user, key);
    setTab('home');
  };

  const findItem = (id) => items.find((item) => item.id === id);

  // 投稿者のアバター（メンバー一覧に載らない分は既定のアバターになる）
  const avatars = useMemo(() => {
    const map = {};
    members.forEach((m) => (map[m.id] = m.avatar));
    if (atelierId && artist) map[atelierId] = artist.avatar;
    map[uid] = user.avatar;
    return map;
  }, [members, atelierId, artist, uid, user.avatar]);

  const ranking = members.map((m) => ({ id: m.id, name: m.name, count: m.giftCount, isMe: m.id === uid }));

  const renderHome = () => {
    if (!atelierId || !hasAtelier) return <NoAtelierScreen denied={denied} onJoin={join} />;
    if (loading) return <div className="login__spinner" role="status" aria-label="読み込み中" />;
    return (
      <HomeScreen
        role={role}
        myUid={uid}
        posts={posts}
        avatars={avatars}
        items={items}
        comments={comments}
        commentQuota={commentQuota}
        onReact={(postId, emoji, mine) => run(api.toggleReaction(atelierId, postId, uid, emoji, mine))}
        onComment={(postId, text) => tryRun(api.addComment(atelierId, postId, uid, user, text))}
        onToggleDone={(id) => {
          const item = findItem(id);
          if (item) run(api.toggleDone(atelierId, item));
        }}
        onSendGift={(id) => {
          const item = findItem(id);
          if (item) run(api.sendGift(atelierId, uid, user.name, item));
        }}
      />
    );
  };

  return (
    <div className="page">
      <div className="app">
        <AppHeader
          role={role}
          profile={user}
          showStatus={role === 'artist' && hasAtelier}
          isOpen={isOpen}
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
              artistName={hasAtelier ? artistName : undefined}
              hasAtelier={hasAtelier}
              isOpen={isOpen}
              onChangeOpen={(next) => api.setAtelierOpen(uid, next)}
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

        {tab === 'home' && hasAtelier && !loading && (
          <ComposeButton
            isArtist={role === 'artist'}
            me={user}
            placeholder={role === 'artist' ? 'いま何してる？' : `${artistName}さんやファンのみんなに向けて投稿する`}
            onPost={(text, options) => run(api.createPost(atelierId, uid, user, text, options))}
            onAddItem={(tag, text) => run(api.addItem(atelierId, tag, text))}
          />
        )}

        <TabBar active={tab} onChange={setTab} badges={{ notification: hasAtelier ? unread : 0 }} />
      </div>

      {isProfileOpen && <ProfileModal profile={user} onSave={saveProfile} onClose={closeProfile} />}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
