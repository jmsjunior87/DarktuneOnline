
import React, { createContext, useContext } from 'react';
import { useMusicPlayer, PlayerState } from '@/hooks/useMusicPlayer';
import { Song } from '@/services/googleDrive';
import { PlaylistState } from '@/hooks/usePlaylist';

interface MusicPlayerContextType {
  playerState: PlayerState;
  playlistState: PlaylistState;
  playSong: (song: Song, albumSongs?: Song[]) => void;
  pauseSong: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  playNext: () => void;
  playPrevious: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🎵 MusicPlayerProvider inicializando...');
  const musicPlayer = useMusicPlayer();

  return (
    <MusicPlayerContext.Provider value={musicPlayer}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayerContext = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    console.error('❌ useMusicPlayerContext deve ser usado dentro de MusicPlayerProvider');
    throw new Error('useMusicPlayerContext must be used within a MusicPlayerProvider');
  }
  return context;
};
