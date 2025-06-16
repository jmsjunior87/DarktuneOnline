
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

  static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  private async makeRequest(endpoint: string, token: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Drive API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async findAlbumsFolder(token: string): Promise<string | null> {
    const query = "name='Albums' and mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false";
    const response = await this.makeRequest(`/files?q=${encodeURIComponent(query)}`, token);
    
    return response.files.length > 0 ? response.files[0].id : null;
  }

  async getAlbumFolders(albumsFolderId: string, token: string): Promise<DriveFile[]> {
    const query = `'${albumsFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const response = await this.makeRequest(`/files?q=${encodeURIComponent(query)}`, token);
    
    return response.files;
  }

  async getFilesInFolder(folderId: string, token: string): Promise<DriveFile[]> {
    const query = `'${folderId}' in parents and trashed=false`;
    const response = await this.makeRequest(`/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,webContentLink)`, token);
    
    return response.files;
  }

  async getAlbums(token: string): Promise<Album[]> {
    console.log('Buscando pasta Albums...');
    const albumsFolderId = await this.findAlbumsFolder(token);
    
    if (!albumsFolderId) {
      console.log('Pasta Albums não encontrada');
      return [];
    }

    console.log('Pasta Albums encontrada:', albumsFolderId);
    const albumFolders = await this.getAlbumFolders(albumsFolderId, token);
    console.log('Pastas de álbuns encontradas:', albumFolders.length);

    const albums: Album[] = [];

    for (const folder of albumFolders) {
      console.log('Processando álbum:', folder.name);
      const files = await this.getFilesInFolder(folder.id, token);
      
      const songs: Song[] = [];
      let coverUrl: string | undefined;

      for (const file of files) {
        if (this.isAudioFile(file.name)) {
          songs.push({
            id: file.id,
            name: file.name,
            url: file.webContentLink || '',
            albumId: folder.id
          });
        } else if (this.isCoverFile(file.name)) {
          coverUrl = `https://drive.google.com/uc?id=${file.id}`;
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
