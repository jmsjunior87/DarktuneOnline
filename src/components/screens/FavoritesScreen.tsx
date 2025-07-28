import { Heart, Play } from 'lucide-react';
import { useFavorites } from "@/contexts/FavoritesContext";
import { Card, CardContent } from '@/components/ui/card';
import { useMusicPlayerContext } from '@/contexts/MusicPlayerContext';

const FavoritesScreen = () => {
  const { favorites, toggleFavorite } = useFavorites();
  const { playSong, playerState } = useMusicPlayerContext();

  return (
    <div className="p-4 h-full">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="w-6 h-6 text-red-500" />
        <h2 className="text-xl font-semibold">Favoritos</h2>
      </div>
      
      {favorites.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-gray-400">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-lg mb-2">Nenhuma música favorita</p>
            <p className="text-sm">Adicione músicas aos favoritos para vê-las aqui</p>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="space-y-2 w-full max-w-3xl">
            {favorites.map((song, index) => (
              <Card
                key={song.id}
                onClick={() => playSong(song, favorites)}
                className={`bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer ${
                  playerState.currentSong?.id === song.id ? 'bg-gray-750 border-red-500' : ''
                }`}
                tabIndex={0}
                role="button"
                aria-label={`Tocar ${song.name}`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-gray-700 text-gray-400">
                      {index + 1}
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
                    {/* Botão de desfavoritar */}
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavorite(song); // Passe o objeto song inteiro
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
                    <div>
                      <Play className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesScreen;