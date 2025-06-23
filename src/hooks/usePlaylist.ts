
import { useState, useCallback } from 'react';
import { Song } from '@/services/googleDrive';

export interface PlaylistState {
  queue: Song[];
  currentIndex: number;
  isShuffled: boolean;
  isRepeat: boolean;
}

export const usePlaylist = () => {
  const [playlistState, setPlaylistState] = useState<PlaylistState>({
    queue: [],
    currentIndex: -1,
    isShuffled: false,
    isRepeat: false
  });

  const setQueue = useCallback((songs: Song[], startIndex: number = 0) => {
    console.log('🎵 Definindo nova playlist com', songs.length, 'músicas, iniciando no índice', startIndex);
    setPlaylistState(prev => ({
      ...prev,
      queue: songs,
      currentIndex: startIndex
    }));
  }, []);

  const getCurrentSong = useCallback((): Song | null => {
    if (playlistState.currentIndex >= 0 && playlistState.currentIndex < playlistState.queue.length) {
      return playlistState.queue[playlistState.currentIndex];
    }
    return null;
  }, [playlistState.queue, playlistState.currentIndex]);

  const getNextSong = useCallback((): Song | null => {
    if (playlistState.queue.length === 0) return null;

    let nextIndex = playlistState.currentIndex + 1;
    
    if (nextIndex >= playlistState.queue.length) {
      if (playlistState.isRepeat) {
        nextIndex = 0;
      } else {
        return null;
      }
    }

    return playlistState.queue[nextIndex];
  }, [playlistState]);

  const getPreviousSong = useCallback((): Song | null => {
    if (playlistState.queue.length === 0) return null;

    let prevIndex = playlistState.currentIndex - 1;
    
    if (prevIndex < 0) {
      if (playlistState.isRepeat) {
        prevIndex = playlistState.queue.length - 1;
      } else {
        return null;
      }
    }

    return playlistState.queue[prevIndex];
  }, [playlistState]);

  const playNext = useCallback(() => {
    const nextSong = getNextSong();
    if (nextSong) {
      const nextIndex = playlistState.currentIndex + 1 >= playlistState.queue.length 
        ? (playlistState.isRepeat ? 0 : playlistState.currentIndex + 1)
        : playlistState.currentIndex + 1;
      
      setPlaylistState(prev => ({
        ...prev,
        currentIndex: nextIndex
      }));
      return nextSong;
    }
    return null;
  }, [getNextSong, playlistState]);

  const playPrevious = useCallback(() => {
    const prevSong = getPreviousSong();
    if (prevSong) {
      const prevIndex = playlistState.currentIndex - 1 < 0
        ? (playlistState.isRepeat ? playlistState.queue.length - 1 : 0)
        : playlistState.currentIndex - 1;
      
      setPlaylistState(prev => ({
        ...prev,
        currentIndex: prevIndex
      }));
      return prevSong;
    }
    return null;
  }, [getPreviousSong, playlistState]);

  const playSongAt = useCallback((index: number) => {
    if (index >= 0 && index < playlistState.queue.length) {
      setPlaylistState(prev => ({
        ...prev,
        currentIndex: index
      }));
      return playlistState.queue[index];
    }
    return null;
  }, [playlistState.queue]);

  return {
    playlistState,
    setQueue,
    getCurrentSong,
    getNextSong,
    getPreviousSong,
    playNext,
    playPrevious,
    playSongAt
  };
};
