
import { useState } from 'react';
import { Music } from 'lucide-react';
import AlbumsScreen from '@/components/screens/AlbumsScreen';
import AlbumDetailScreen from '@/components/screens/AlbumDetailScreen';
import FavoritesScreen from '@/components/screens/FavoritesScreen';
import PlaylistsScreen from '@/components/screens/PlaylistsScreen';
import SettingsScreen from '@/components/screens/SettingsScreen';
import NavigationBar from '@/components/navigation/NavigationBar';
import { Album } from '@/services/googleDrive';

const Index = () => {
  const [activeScreen, setActiveScreen] = useState('albums');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  const renderActiveScreen = () => {
    if (selectedAlbum) {
      return <AlbumDetailScreen album={selectedAlbum} onBack={() => setSelectedAlbum(null)} />;
    }

    switch (activeScreen) {
      case 'albums':
        return <AlbumsScreen onAlbumSelect={setSelectedAlbum} />;
      case 'favorites':
        return <FavoritesScreen />;
      case 'playlists':
        return <PlaylistsScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <AlbumsScreen onAlbumSelect={setSelectedAlbum} />;
    }
  };

  const handleScreenChange = (screen: string) => {
    setActiveScreen(screen);
    setSelectedAlbum(null);
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Music className="w-8 h-8 text-red-500" />
          <h1 className="text-2xl font-bold text-red-500">DarkTune</h1>
        </div>
      </header>

      {/* Main Content - flex-1 with overflow hidden */}
      <main className="flex-1 overflow-hidden">
        {renderActiveScreen()}
      </main>

      {/* Navigation - fixed at bottom */}
      <div className="flex-shrink-0">
        <NavigationBar activeScreen={activeScreen} onScreenChange={handleScreenChange} />
      </div>
    </div>
  );
};

export default Index;
