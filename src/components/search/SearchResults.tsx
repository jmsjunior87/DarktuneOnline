
import { Music, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchResult } from '@/hooks/useSearch';
import { Album } from '@/services/googleDrive';
import { useMusicPlayerContext } from '@/contexts/MusicPlayerContext';

interface SearchResultsProps {
  results: SearchResult[];
  onAlbumSelect: (album: Album) => void;
}

const SearchResults = ({ results, onAlbumSelect }: SearchResultsProps) => {
  const { playSong, playerState } = useMusicPlayerContext();

  const handlePlaySong = (result: SearchResult) => {
    if (result.song) {
      playSong(result.song);
    }
  };

  if (results.length === 0) {
    return (
      <div className="text-center text-gray-400 mt-8">
        <Music className="w-12 h-12 mx-auto mb-4 text-gray-600" />
        <p>Nenhum resultado encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result, index) => (
        <Card 
          key={`${result.type}-${result.album?.id || result.song?.id}-${index}`}
          className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors"
        >
          <CardContent className="p-3">
            {result.type === 'album' && result.album ? (
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => onAlbumSelect(result.album!)}
              >
                <div className="w-12 h-12 rounded bg-gray-700 flex items-center justify-center flex-shrink-0">
                  {result.album.coverUrl ? (
                    <img 
                      src={result.album.coverUrl} 
                      alt={result.album.name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <Music className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">{result.album.name}</h3>
                  <p className="text-sm text-gray-400">
                    Álbum • {result.album.songs.length} música{result.album.songs.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-red-400">
                    {result.matchedFields.includes('album') && 'Nome do álbum'}
                    {result.matchedFields.includes('songs') && result.matchedFields.includes('album') && ' • '}
                    {result.matchedFields.includes('songs') && 'Contém músicas correspondentes'}
                  </p>
                </div>
              </div>
            ) : result.song ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <Music className="w-6 h-6 text-gray-500" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-medium ${
                    playerState.currentSong?.id === result.song.id ? 'text-red-400' : 'text-white'
                  }`}>
                    {result.song.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {result.song.artist && `${result.song.artist} • `}
                    {result.song.albumName}
                  </p>
                  <p className="text-xs text-red-400">
                    {result.matchedFields.includes('title') && 'Título da música'}
                    {result.matchedFields.includes('artist') && result.matchedFields.includes('title') && ' • '}
                    {result.matchedFields.includes('artist') && 'Nome do artista'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  onClick={() => handlePlaySong(result)}
                >
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SearchResults;
