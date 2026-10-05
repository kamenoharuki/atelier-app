import { useState } from 'react';
import ArtistHeader from './components/ArtistHeader';
import TabBar from './components/TabBar';
import type { Tab } from './components/TabBar';
import HomeScreen from './screens/HomeScreen';
import NotificationScreen from './screens/NotificationScreen';
import SettingsScreen from './screens/SettingsScreen';
import type { ArtistStatus } from './data';
import './App.css';

export default function App() {
  const [status, setStatus] = useState<ArtistStatus>('制作中');
  const [tab, setTab] = useState<Tab>('home');

  return (
    <div className="page">
      <div className="phone">
        <div className="phone__screen">
          {tab !== 'settings' && (
            <ArtistHeader name="namenamename" status={status} onChangeStatus={setStatus} />
          )}

          <div className="phone__content">
            {tab === 'home' && <HomeScreen />}
            {tab === 'notification' && <NotificationScreen />}
            {tab === 'settings' && <SettingsScreen />}
          </div>

          <TabBar active={tab} onChange={setTab} />
        </div>
      </div>
    </div>
  );
}
