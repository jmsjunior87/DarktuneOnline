
import React, { createContext, useContext } from 'react';
import { useMusicPlayer, PlayerState } from '@/hooks/useMusicPlayer';
import { Song } from '@/services/googleDrive';

interface MusicPlayerContextType {
  playerState: PlayerState;
  playSong: (song: Song) => void;
  pauseSong: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    throw new Error('useMusicPlayerContext must be used within a MusicPlayerProvider');
  }
  return context;
};
