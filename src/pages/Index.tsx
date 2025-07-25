
import { useState } from 'react';
import { Music } from 'lucide-react';
import AlbumsScreen from '@/components/screens/AlbumsScreen';
import AlbumDetailScreen from '@/components/screens/AlbumDetailScreen';
import FavoritesScreen from '@/components/screens/FavoritesScreen';
import PlaylistsScreen from '@/components/screens/PlaylistsScreen';
import SettingsScreen from '@/components/screens/SettingsScreen';
import NavigationBar from '@/components/navigation/NavigationBar';
import { Album } from '@/services/googleDrive';
import MusicPlayerControls from '@/components/player/MusicPlayerControls';
import { useMusicPlayerContext } from '@/contexts/MusicPlayerContext';

const Index = () => {
  console.log('📱 Index component renderizando...');
  
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

  // Tentar obter o contexto do player
  let playerState;
  try {
    console.log('🎵 Tentando obter contexto do music player...');
    const context = useMusicPlayerContext();
    playerState = context.playerState;
    console.log('✅ Contexto do music player obtido com sucesso');
  } catch (error) {
    console.error('❌ Erro ao obter contexto do music player:', error);
    // Usar estado padrão se o contexto não estiver disponível
    playerState = { currentSong: null };
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Music className="w-8 h-8 text-red-500" />
          <h1 className="text-2xl font-bold text-red-500">DarkTune</h1>
        </div>
      </header>

      {/* Main Content - adjust for player */}
      <main className={`flex-1 overflow-hidden ${playerState.currentSong ? 'pb-36' : ''}`}>
        {renderActiveScreen()}
      </main>

      {/* Music Player Controls - conditionally rendered */}
      {playerState.currentSong && (
        <div className="fixed bottom-16 left-0 right-0 z-50">
          <MusicPlayerControls />
        </div>
      )}

      {/* Navigation - fixed at bottom */}
      <div className="flex-shrink-0">
        <NavigationBar activeScreen={activeScreen} onScreenChange={handleScreenChange} />
      </div>
    </div>
  );
};

export default Index;
