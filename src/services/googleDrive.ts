
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
}

export class GoogleDriveService {
  private static instance: GoogleDriveService;
  private baseUrl = 'https://www.googleapis.com/drive/v3';
  private apiKey = 'AIzaSyD8zoU0KerJB_4cXBMpjbS_jNkxJnSjgNM';
  private albumsFolderId = '10L4y3OqfXgMbC043uP0nKMHQ5iqMHj5b';

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

  async getAlbums(): Promise<Album[]> {
    console.log('Carregando álbuns do Google Drive...');
    console.log('Usando pasta Albums ID:', this.albumsFolderId);
    
    const albumFolders = await this.getAlbumFolders();
    console.log('Pastas de álbuns encontradas:', albumFolders.length);

    const albums: Album[] = [];

    for (const folder of albumFolders) {
      console.log('Processando álbum:', folder.name);
      const files = await this.getFilesInFolder(folder.id);
      
      const songs: Song[] = [];
      let coverUrl: string | undefined;

      for (const file of files) {
        if (this.isAudioFile(file.name)) {
          songs.push({
            id: file.id,
            name: file.name,
            url: `https://drive.google.com/uc?id=${file.id}`,
            albumId: folder.id
          });
        } else if (this.isCoverFile(file.name)) {
          // Usar a URL de visualização direta para imagens
          coverUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w400-h400`;
          console.log('Capa encontrada para', folder.name, ':', coverUrl);
        }
      }

      if (songs.length > 0) {
        albums.push({
          id: folder.id,
          name: folder.name,
          coverUrl,
          songs
        });
      }
    }

    console.log('Álbuns processados:', albums.length);
    return albums;
  }

  private isAudioFile(filename: string): boolean {
    const audioExtensions = ['.mp3', '.opus', '.m4a', '.flac', '.wav'];
    return audioExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }

  private isCoverFile(filename: string): boolean {
    const coverNames = ['cover.jpg', 'cover.jpeg', 'cover.png', 'album.jpg', 'album.jpeg', 'album.png'];
    return coverNames.includes(filename.toLowerCase());
  }
}
