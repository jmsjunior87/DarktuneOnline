export interface AlbumTrack {
  id: string;
  title: string;
  artist: string;
  trackNumber: number;
  duration: string;
}

export interface AlbumData {
  id: string;
  name: string;
  coverUrl?: string;
  tracks: AlbumTrack[];
}

export interface AlbumsRegistry {
  [key: string]: AlbumData;
}