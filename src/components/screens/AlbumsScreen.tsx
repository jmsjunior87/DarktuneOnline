
import { useState } from 'react';
import { Music, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { useSearch } from '@/hooks/useSearch';
import { Album } from '@/services/googleDrive';
import SearchResults from '@/components/search/SearchResults';

interface AlbumsScreenProps {
  onAlbumSelect: (album: Album) => void;
}

const AlbumsScreen = ({ onAlbumSelect }: AlbumsScreenProps) => {
  const { albums, isLoading, loadAlbums } = useGoogleDrive();
  const { searchTerm, setSearchTerm, searchResults, hasResults } = useSearch(albums);

  // Filtrar álbuns apenas se não houver busca ativa
  const filteredAlbums = !searchTerm ? albums : [];

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 flex items-center gap-2 border-b border-gray-700">
          <Music className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-semibold">Meus Albums</h2>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
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
      <div className="h-full flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
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
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <Music className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-lg mb-2">Nenhum álbum encontrado</p>
            <p className="text-sm">
              Verifique se existe uma pasta "Albums" no Google Drive com subpastas para cada álbum
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with title and refresh button */}
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Music className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-semibold">
              {searchTerm ? 'Resultados da Busca' : 'Meus Albums'}
            </h2>
            <span className="text-sm text-gray-400">
              ({searchTerm ? searchResults.length : filteredAlbums.length})
            </span>
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

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar álbuns, músicas ou artistas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-red-500"
          />
          {searchTerm && (
            <Button
              onClick={() => setSearchTerm('')}
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-auto text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {searchTerm ? (
          <SearchResults results={searchResults} onAlbumSelect={onAlbumSelect} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredAlbums.map((album) => (
              <Card 
                key={album.id} 
                className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer"
                onClick={() => onAlbumSelect(album)}
              >
                <CardContent className="p-3">
                  <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-700">
                    {album.coverUrl ? (
                      <img 
                        src={album.coverUrl} 
                        alt={album.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('Erro ao carregar capa do álbum:', album.name, album.coverUrl);
                          e.currentTarget.style.display = 'none';
                        }}
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
        )}
      </div>
    </div>
  );
};

export default AlbumsScreen;
