
import { useState, useRef, useEffect, useCallback } from 'react';
import { Song } from '@/services/googleDrive';
import { GoogleDriveService } from '@/services/googleDrive';

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
    audio.crossOrigin = 'anonymous';
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
      console.log('🏁 Música terminou');
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
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
        error: 'Não foi possível reproduzir este arquivo'
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
    };
  }, []);

  const playSong = useCallback(async (song: Song) => {
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

      // Para a música atual
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      // Obtém a URL de streaming direta
      const streamingUrl = await driveService.getStreamingUrl(song.url);
      console.log('🔗 URL de streaming:', streamingUrl);

      // Define a URL no elemento de áudio
      audioRef.current.src = streamingUrl;
      
      // Tenta reproduzir
      await audioRef.current.play();
      console.log('✅ Reprodução iniciada!');
      setPlayerState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
      
    } catch (error) {
      console.error('❌ Erro ao reproduzir:', error);
      setPlayerState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        isLoading: false,
        error: 'Arquivo não encontrado ou não está público no Google Drive'
      }));
    }
  }, [driveService]);

  const pauseSong = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setPlayerState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const togglePlay = useCallback(() => {
    if (playerState.isPlaying) {
      pauseSong();
    } else if (playerState.currentSong) {
      playSong(playerState.currentSong);
    }
  }, [playerState.isPlaying, playerState.currentSong, pauseSong, playSong]);

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
    playSong,
    pauseSong,
    togglePlay,
    setVolume,
    seekTo,
  };
};
