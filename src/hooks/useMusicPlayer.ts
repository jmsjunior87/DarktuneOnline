
import { useState, useRef, useEffect, useCallback } from 'react';
import { Song } from '@/services/googleDrive';
import { GoogleDriveService } from '@/services/googleDrive';
import { usePlaylist } from './usePlaylist';

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: string | null;
}

export const useMusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const driveService = GoogleDriveService.getInstance();
  const currentBlobUrlRef = useRef<string | null>(null);
  const playlist = usePlaylist();
  
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    volume: 1,
    currentTime: 0,
    duration: 0,
    isLoading: false,
    error: null,
  });

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      console.log('✅ Metadados carregados, duração:', audio.duration);
      setPlayerState(prev => ({ 
        ...prev, 
        duration: audio.duration || 0,
        isLoading: false,
        error: null
      }));
    };

    const handleCanPlay = () => {
      console.log('✅ Áudio pode ser reproduzido');
      setPlayerState(prev => ({ ...prev, isLoading: false, error: null }));
    };

    const handleTimeUpdate = () => {
      setPlayerState(prev => ({ ...prev, currentTime: audio.currentTime }));
    };

    const handleEnded = () => {
      console.log('🏁 Música terminou, reproduzindo próxima...');
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
      
      // Reproduzir próxima música automaticamente
      const nextSong = playlist.playNext();
      if (nextSong) {
        console.log('▶️ Reproduzindo próxima música:', nextSong.name);
        playSongInternal(nextSong);
      }
    };

    const handleError = (e: Event) => {
      console.error('❌ Erro no áudio:', {
        error: e,
        networkState: audio.networkState,
        readyState: audio.readyState,
        src: audio.src
      });
      
      setPlayerState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isPlaying: false,
        error: 'Erro ao reproduzir arquivo de áudio.'
      }));
    };

    const handleLoadStart = () => {
      console.log('🎵 Iniciando carregamento...');
      setPlayerState(prev => ({ ...prev, isLoading: true, error: null }));
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.pause();
      
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      }
    };
  }, [playlist]);

  const playSongInternal = useCallback(async (song: Song) => {
    if (!audioRef.current) {
      console.error('❌ Audio ref não disponível');
      return;
    }

    console.log('🎵 Reproduzindo:', song.name);
    console.log('📂 ID do arquivo:', song.url);
    
    try {
      setPlayerState(prev => ({ 
        ...prev, 
        error: null, 
        isLoading: true,
        currentSong: song,
        currentTime: 0
      }));

      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
        currentBlobUrlRef.current = null;
      }

      console.log('📥 Iniciando download do arquivo...');
      const blobUrl = await driveService.downloadFileAsBlob(song.url);
      currentBlobUrlRef.current = blobUrl;
      
      console.log('🔗 Usando URL local:', blobUrl);
      audioRef.current.src = blobUrl;
      
      await new Promise((resolve, reject) => {
        const handleCanPlay = () => {
          audioRef.current?.removeEventListener('canplay', handleCanPlay);
          audioRef.current?.removeEventListener('error', handleError);
          resolve(true);
        };
        
        const handleError = () => {
          audioRef.current?.removeEventListener('canplay', handleCanPlay);
          audioRef.current?.removeEventListener('error', handleError);
          reject(new Error('Erro ao carregar arquivo local'));
        };
        
        audioRef.current?.addEventListener('canplay', handleCanPlay);
        audioRef.current?.addEventListener('error', handleError);
        
        setTimeout(() => {
          audioRef.current?.removeEventListener('canplay', handleCanPlay);
          audioRef.current?.removeEventListener('error', handleError);
          reject(new Error('Timeout no carregamento'));
        }, 15000);
      });
      
      await audioRef.current.play();
      console.log('✅ Reprodução iniciada com sucesso!');
      setPlayerState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
      
    } catch (error) {
      console.error('❌ Erro ao reproduzir:', error);
      setPlayerState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        isLoading: false,
        error: 'Não foi possível baixar ou reproduzir este arquivo. Verifique se o arquivo está acessível no Google Drive.'
      }));
    }
  }, [driveService]);

  const playSong = useCallback(async (song: Song, albumSongs?: Song[]) => {
    if (albumSongs) {
      const songIndex = albumSongs.findIndex(s => s.id === song.id);
      playlist.setQueue(albumSongs, songIndex);
    }
    await playSongInternal(song);
  }, [playSongInternal, playlist]);

  const pauseSong = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setPlayerState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const togglePlay = useCallback(() => {
    if (playerState.isPlaying) {
      pauseSong();
    } else if (playerState.currentSong) {
      playSongInternal(playerState.currentSong);
    }
  }, [playerState.isPlaying, playerState.currentSong, pauseSong, playSongInternal]);

  const setVolume = useCallback((volume: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    setPlayerState(prev => ({ ...prev, volume }));
  }, []);

  const seekTo = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setPlayerState(prev => ({ ...prev, currentTime: time }));
  }, []);

  return {
    playerState,
    playlistState: playlist.playlistState,
    playSong,
    pauseSong,
    togglePlay,
    setVolume,
    seekTo,
    playNext: () => {
      const nextSong = playlist.playNext();
      if (nextSong) playSongInternal(nextSong);
    },
    playPrevious: () => {
      const prevSong = playlist.playPrevious();
      if (prevSong) playSongInternal(prevSong);
    }
  };
};
