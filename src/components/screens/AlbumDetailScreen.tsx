
import { ArrowLeft, Play, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Album } from '@/services/googleDrive';

interface AlbumDetailScreenProps {
  album: Album;
  onBack: () => void;
}

const AlbumDetailScreen = ({ album, onBack }: AlbumDetailScreenProps) => {
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
            <Button className="bg-red-500 hover:bg-red-600 text-white">
              <Play className="w-4 h-4 mr-2" />
              Reproduzir
            </Button>
          </div>
        </div>

        {/* Songs list */}
        <div className="space-y-2">
          {album.songs.map((song, index) => (
            <Card key={song.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm text-gray-400">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white text-sm font-medium">
                      {song.name.replace(/\.(mp3|opus|m4a|flac|wav)$/i, '')}
                    </h3>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                    onClick={() => {
                      console.log('Reproduzindo:', song.name);
                      console.log('URL:', song.url);
                    }}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlbumDetailScreen;
