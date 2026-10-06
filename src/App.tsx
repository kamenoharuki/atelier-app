import { useCallback, useState } from 'react';
import AppHeader from './components/AppHeader';
import ProfileModal from './components/ProfileModal';
import TabBar from './components/TabBar';
import type { Tab } from './components/TabBar';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import NotificationScreen from './screens/NotificationScreen';
import type { RankingRow } from './screens/NotificationScreen';
import SettingsScreen from './screens/SettingsScreen';
import type { ArtistStatus, Notice, Profile, Role, Tag, TimelineItem } from './data';
import { FAN_BASE_SUPPORT, RANKING, buildFanNotices, initialItems, initialMood, initialNotices, initialProfiles } from './data';
import './App.css';

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function App() {
  // ログイン中のロール（null = 未ログイン → ログイン画面）
  const [role, setRole] = useState<Role | null>(null);
  const [profiles, setProfiles] = useState<Record<Role, Profile>>(initialProfiles);
  const [status, setStatus] = useState<ArtistStatus>('制作中');
  const [mood, setMood] = useState(initialMood);
  const [items, setItems] = useState<TimelineItem[]>(initialItems);
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [fanGifts, setFanGifts] = useState(0);
  const [tab, setTab] = useState<Tab>('home');
  const [isProfileOpen, setProfileOpen] = useState(false);

  const closeProfile = useCallback(() => setProfileOpen(false), []);

  if (!role) {
    return (
      <div className="page">
        <LoginScreen
          onLogin={(nextRole) => {
            setRole(nextRole);
            setTab('home');
          }}
        />
      </div>
    );
  }

  const profile = profiles[role];
  const artist = profiles.artist;
  const fan = profiles.fan;

  const logout = () => {
    setProfileOpen(false);
    setRole(null);
  };

  const saveProfile = (next: Profile) => {
    setProfiles((prev) => ({ ...prev, [role]: next }));
    setProfileOpen(false);
  };

  const pushNotice = (text: string) => {
    setNotices((prev) => [{ id: newId(), text, time: 'たった今' }, ...prev]);
  };

  const addItem = (tag: Tag, text: string) => {
    setItems((prev) => [{ id: newId(), tag, text, giftCount: 0, done: false }, ...prev]);
  };

  const toggleDone = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  const sendGift = (id: string) => {
    const target = items.find((item) => item.id === id);
    if (!target) return;
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, giftCount: item.giftCount + 1 } : item)));
    setFanGifts((n) => n + 1);
    pushNotice(`${fan.name}さんから「${target.text}」にギフトが届きました`);
  };

  const sendCheer = (text: string) => {
    pushNotice(`${fan.name}さんから応援メッセージ：「${text}」`);
  };

  const ranking: RankingRow[] = [
    ...RANKING.map((entry) => ({ ...entry, isMe: false })),
    { id: 'me', name: fan.name, count: FAN_BASE_SUPPORT + fanGifts, isMe: role === 'fan' },
  ].sort((a, b) => b.count - a.count);

  return (
    <div className="page">
      <div className="app">
        <AppHeader
          role={role}
          profile={profile}
          artistName={artist.name}
          status={status}
          onChangeStatus={setStatus}
          onOpenProfile={() => setProfileOpen(true)}
          onLogout={logout}
        />

        <main className="app__content">
          {tab === 'home' && (
            <HomeScreen
              role={role}
              artistName={artist.name}
              status={status}
              mood={mood}
              items={items}
              onPostMood={setMood}
              onAddItem={addItem}
              onToggleDone={toggleDone}
              onSendGift={sendGift}
              onSendCheer={sendCheer}
            />
          )}
          {tab === 'notification' && (
            <NotificationScreen
              role={role}
              notices={role === 'artist' ? notices : buildFanNotices(artist.name, status, mood)}
              ranking={ranking}
            />
          )}
          {tab === 'settings' && (
            <SettingsScreen
              role={role}
              profile={profile}
              artistName={artist.name}
              status={status}
              onEditProfile={() => setProfileOpen(true)}
              onLogout={logout}
            />
          )}
        </main>

        <TabBar active={tab} onChange={setTab} />
      </div>

      {isProfileOpen && <ProfileModal profile={profile} onSave={saveProfile} onClose={closeProfile} />}
    </div>
  );
}
