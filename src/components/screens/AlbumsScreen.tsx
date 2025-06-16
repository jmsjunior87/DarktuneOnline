
import { Music, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';

const AlbumsScreen = () => {
  const { user, isSignedIn, signIn, isLoading: authLoading } = useGoogleAuth();
  const { albums, isLoading: driveLoading, loadAlbums } = useGoogleDrive();

  if (!isSignedIn) {
    return (
      <div className="p-4 h-full">
        <div className="flex items-center gap-2 mb-6">
          <Music className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-semibold">Meus Albums</h2>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Music className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-lg mb-4 text-gray-300">Conecte-se ao Google Drive</p>
            <p className="text-sm text-gray-400 mb-6">
              Faça login para acessar seus álbuns salvos no Google Drive
            </p>
            <Button 
              onClick={signIn}
              disabled={authLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {authLoading ? 'Conectando...' : 'Conectar com Google'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (driveLoading) {
    return (
      <div className="p-4 h-full">
        <div className="flex items-center gap-2 mb-6">
          <Music className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-semibold">Meus Albums</h2>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg">Carregando álbuns...</p>
          </div>
        </div>
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="p-4 h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Music className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-semibold">Meus Albums</h2>
          </div>
          <Button 
            onClick={loadAlbums}
            size="sm"
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Atualizar
          </Button>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-gray-400">
            <Music className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-lg mb-2">Nenhum álbum encontrado</p>
            <p className="text-sm">
              Crie uma pasta "Albums" no Google Drive com subpastas para cada álbum
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Music className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-semibold">Meus Albums</h2>
          <span className="text-sm text-gray-400">({albums.length})</span>
        </div>
        <Button 
          onClick={loadAlbums}
          size="sm"
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {albums.map((album) => (
          <Card key={album.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer">
            <CardContent className="p-3">
              <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-700">
                {album.coverUrl ? (
                  <img 
                    src={album.coverUrl} 
                    alt={album.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-8 h-8 text-gray-500" />
                  </div>
                )}
              </div>
              <h3 className="font-medium text-sm text-white mb-1 truncate">
                {album.name}
              </h3>
              <p className="text-xs text-gray-400">
                {album.songs.length} música{album.songs.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AlbumsScreen;
