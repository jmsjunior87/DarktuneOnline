import { albumsRegistry } from '@/data/albums';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  webContentLink?: string;
}

export interface Album {
  id: string;
  name: string;
  coverUrl?: string;
  songs: Song[];
}

export interface Song {
  id: string;
  name: string;
  url: string;
  albumId: string;
  albumName?: string;
  artist?: string;
  coverUrl?: string;
  trackNumber?: number;
  duration?: string;
  // coverUrl?: string; // Se quiser, pode adicionar aqui para cada música
}

export class GoogleDriveService {
  private static instance: GoogleDriveService;
  private baseUrl = 'https://www.googleapis.com/drive/v3';
  private apiKey = 'AIzaSyD8zoU0KerJB_4cXBMpjbS_jNkxJnSjgNM';
  private albumsFolderId = '10L4y3OqfXgMbC043uP0nKMHQ5iqMHj5b';
  private blobCache: Record<string, string> = {};

  public clearBlobCache(fileId: string) {
    if (this.blobCache[fileId]) {
      delete this.blobCache[fileId];
    }
  }

  static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}&key=${this.apiKey}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Drive API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Download do arquivo via proxy backend OU fallback direto do Google Drive
  async downloadFileAsBlob(fileId: string): Promise<string> {
    // Verifica se já existe no cache
    if (this.blobCache[fileId]) {
      return this.blobCache[fileId];
    }

    // Tenta baixar via proxy
    try {
      const proxyUrl = `https://darktuneonline.onrender.com/api/drive/${fileId}`;
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Range': 'bytes=0-'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        this.blobCache[fileId] = audioUrl;
        console.log('✅ Arquivo baixado com sucesso via proxy, URL local criada');
        return audioUrl;
      }
    } catch (error) {
      console.error('❌ Erro ao baixar arquivo via proxy:', error);
    }

    // Fallback: download direto do Google Drive
    try {
      const downloadUrls = [
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${this.apiKey}`,
        `https://drive.google.com/uc?export=download&id=${fileId}`,
      ];

      for (const url of downloadUrls) {
        try {
          console.log('🔗 Tentando baixar de:', url);

          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Range': 'bytes=0-'
            }
          });

          if (response.ok) {
            const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);
            this.blobCache[fileId] = audioUrl;
            console.log('✅ Arquivo baixado com sucesso, URL local criada');
            return audioUrl;
          }
        } catch (error) {
          console.log('⚠️ Falha no download, tentando próxima URL...', error);
          continue;
        }
      }

      throw new Error('Não foi possível baixar o arquivo');
    } catch (error) {
      console.error('❌ Erro ao baixar arquivo:', error);
      throw error;
    }
  }

  async getAlbumFolders(): Promise<DriveFile[]> {
    const query = `'${this.albumsFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const response = await this.makeRequest(`/files?q=${encodeURIComponent(query)}`);
    return response.files;
  }

  async getFilesInFolder(folderId: string): Promise<DriveFile[]> {
    const query = `'${folderId}' in parents and trashed=false`;
    const response = await this.makeRequest(`/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,webContentLink)`);
    return response.files;
  }

  // Extrai artista do nome do arquivo (formato: "Artista - Música.ext")
  private extractArtistFromFilename(filename: string): string | undefined {
    const match = filename.match(/^(.+?)\s*-\s*(.+)\.(mp3|opus|m4a|flac|wav|ogg)$/i);
    return match ? match[1].trim() : undefined;
  }

  // Remove extensão e formatação do nome da música
  private cleanSongName(filename: string): string {
    return filename.replace(/\.(mp3|opus|m4a|flac|wav|ogg)$/i, '').replace(/^.*?\s*-\s*/, '');
  }

  async getAlbums(): Promise<Album[]> {
    console.log('🎵 Carregando álbuns do arquivo local...');

    const albumFolders = await this.getAlbumFolders();
    console.log('📂 Pastas de álbuns encontradas:', albumFolders.length);

    const albums: Album[] = [];

    for (const folder of albumFolders) {
      console.log('🎼 Processando álbum:', folder.name);

      // Buscar dados do álbum no registry local
      const albumKey = Object.keys(albumsRegistry).find(key =>
        albumsRegistry[key].name === folder.name
      );

      if (albumKey) {
        const albumData = albumsRegistry[albumKey];
        console.log('📋 Dados do álbum encontrados no registry:', albumData.name);

        // Buscar arquivos no Google Drive para validar e obter IDs reais
        const files = await this.getFilesInFolder(folder.id);
        let coverUrl: string | undefined;

        // Procurar por capa
        for (const file of files) {
          if (this.isCoverFile(file.name)) {
            coverUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w400-h400`;
            console.log('🖼️ Capa encontrada para', folder.name, ':', coverUrl);
            break;
          }
        }

        // Usar dados do registry para criar as músicas
        const songs: Song[] = albumData.tracks.map(track => ({
          id: track.id,
          name: track.title,
          url: track.id,
          albumId: folder.id,
          albumName: folder.name,
          artist: track.artist,
          trackNumber: track.trackNumber,
          duration: track.duration
        }));

        albums.push({
          id: folder.id,
          name: folder.name,
          coverUrl: coverUrl || `https://drive.google.com/thumbnail?id=${folder.id}&sz=w400-h400`,
          songs
        });

        console.log(`✅ Álbum "${folder.name}" adicionado com ${songs.length} música(s) do registry`);
      } else {
        // Fallback: usar método antigo
        console.log('📋 Fallback: usando arquivos de áudio encontrados');
        const files = await this.getFilesInFolder(folder.id);

        const songs: Song[] = [];
        let coverUrl: string | undefined;

        for (const file of files) {
          if (this.isAudioFile(file.name)) {
            console.log('🎵 Arquivo de áudio encontrado:', file.name);

            const artist = this.extractArtistFromFilename(file.name);
            const cleanName = this.cleanSongName(file.name);

            songs.push({
              id: file.id,
              name: cleanName || file.name,
              url: file.id,
              albumId: folder.id,
              albumName: folder.name,
              artist: artist
            });
          } else if (this.isCoverFile(file.name)) {
            coverUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w400-h400`;
            console.log('🖼️ Capa encontrada para', folder.name, ':', coverUrl);
          }
        }

        if (songs.length > 0) {
          albums.push({
            id: folder.id,
            name: folder.name,
            coverUrl,
            songs
          });
          console.log(`✅ Álbum "${folder.name}" adicionado com ${songs.length} música(s)`);
        }
      }
    }

    console.log('🎉 Total de álbuns processados:', albums.length);
    return albums;
  }

  private isAudioFile(filename: string): boolean {
    const audioExtensions = ['.mp3', '.opus', '.m4a', '.flac', '.wav', '.ogg'];
    return audioExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }

  private isCoverFile(filename: string): boolean {
    const coverNames = ['cover.jpg', 'cover.jpeg', 'cover.png', 'album.jpg', 'album.jpeg', 'album.png'];
    return coverNames.includes(filename.toLowerCase());
  }
}