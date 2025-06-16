
import { useState, useEffect } from 'react';
import { GoogleDriveService, Album } from '@/services/googleDrive';
import { GoogleAuthService } from '@/services/googleAuth';
import { useToast } from '@/hooks/use-toast';

export const useGoogleDrive = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const driveService = GoogleDriveService.getInstance();
  const authService = GoogleAuthService.getInstance();

  const loadAlbums = async () => {
    const token = authService.getAccessToken();
    if (!token) {
      setError('Token de acesso não encontrado');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Carregando álbuns do Google Drive...');
      const albumsData = await driveService.getAlbums(token);
      setAlbums(albumsData);
      
      if (albumsData.length === 0) {
        toast({
          title: "Nenhum álbum encontrado",
          description: "Crie uma pasta 'Albums' no seu Google Drive com subpastas para cada álbum",
        });
      } else {
        console.log(`${albumsData.length} álbuns carregados com sucesso`);
      }
    } catch (error) {
      console.error('Erro ao carregar álbuns:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro ao carregar álbuns",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authService.isSignedIn()) {
      loadAlbums();
    }
  }, []);

  return {
    albums,
    isLoading,
    error,
    loadAlbums
  };
};
