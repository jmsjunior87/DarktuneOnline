import { ArrowLeft, Play, Music, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Album } from '@/services/googleDrive';
import { useMusicPlayerContext } from '@/contexts/MusicPlayerContext';
import { useFavorites } from "@/contexts/FavoritesContext";

interface AlbumDetailScreenProps {
  album: Album;
  onBack: () => void;
}

const AlbumDetailScreen = ({ album, onBack }: AlbumDetailScreenProps) => {
  const { playSong, playerState } = useMusicPlayerContext();
  const { favorites, toggleFavorite } = useFavorites();

  const handlePlayAlbum = () => {
    if (album.songs.length > 0) {
      playSong(album.songs[0], album.songs);
    }
  };

  const handlePlaySong = (song: typeof album.songs[0]) => {
    playSong(song, album.songs);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with back button */}
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="text-gray-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Album info and songs list */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Album header */}
        <div className="flex gap-4 mb-6">
          <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
            {album.coverUrl ? (
              <img 
                src={album.coverUrl} 
                alt={album.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.log('Erro ao carregar imagem:', album.coverUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-12 h-12 text-gray-500" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">{album.name}</h1>
            <p className="text-gray-400 mb-4">
              {album.songs.length} música{album.songs.length !== 1 ? 's' : ''}
            </p>
            <Button 
              onClick={handlePlayAlbum}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Reproduzir
            </Button>
          </div>
        </div>

        {/* Songs list */}
        <div className="flex justify-center">
          <div className="space-y-2 w-full max-w-3xl">
            {album.songs.map((song, index) => (
              <Card 
                key={song.id} 
                onClick={() => handlePlaySong(song)}
                className={`bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer ${
                  playerState.currentSong?.id === song.id ? 'bg-gray-750 border-red-500' : ''
                }`}
                tabIndex={0}
                role="button"
                aria-label={`Tocar ${song.name}`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      playerState.currentSong?.id === song.id && playerState.isPlaying
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {playerState.currentSong?.id === song.id && playerState.isPlaying ? '♪' : index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-medium truncate ${
                        playerState.currentSong?.id === song.id ? 'text-red-400' : 'text-white'
                      }`}>
                        {song.name.replace(/\.(mp3|opus|m4a|flac|wav)$/i, '')}
                      </h3>
                      {song.artist && (
                        <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                      )}
                    </div>
                    {/* Botão de coração */}
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavorite(song);
                      }}
                      className="ml-2"
                      aria-label={favorites.some(f => f.id === song.id) ? "Desfavoritar" : "Favoritar"}
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          favorites.some(f => f.id === song.id)
                            ? "text-red-500 fill-red-500"
                            : "text-gray-400"
                        }`}
                        fill={favorites.some(f => f.id === song.id) ? "currentColor" : "none"}
                      />
                    </button>
                    {/* Botão play visual */}
                    <div>
                      <Play className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumDetailScreen;