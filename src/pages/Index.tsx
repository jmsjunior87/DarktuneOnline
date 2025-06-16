
import { useState } from 'react';
import { Music, Heart, List, Settings, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AlbumsScreen from '@/components/screens/AlbumsScreen';
import FavoritesScreen from '@/components/screens/FavoritesScreen';
import PlaylistsScreen from '@/components/screens/PlaylistsScreen';
import SettingsScreen from '@/components/screens/SettingsScreen';
import NavigationBar from '@/components/navigation/NavigationBar';

const Index = () => {
  const [activeScreen, setActiveScreen] = useState('albums');

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'albums':
        return <AlbumsScreen />;
      case 'favorites':
        return <FavoritesScreen />;
      case 'playlists':
        return <PlaylistsScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <AlbumsScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <Music className="w-8 h-8 text-red-500" />
          <h1 className="text-2xl font-bold text-red-500">DarkTune</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderActiveScreen()}
      </main>

      {/* Navigation */}
      <NavigationBar activeScreen={activeScreen} onScreenChange={setActiveScreen} />
    </div>
  );
};

export default Index;
