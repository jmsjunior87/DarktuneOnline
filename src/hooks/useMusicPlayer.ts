
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
  const currentBlobUrlRef = useRef<string | null>(null);
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

  const cleanupBlobUrl = useCallback(() => {
    if (currentBlobUrlRef.current) {
      console.log('🧹 Limpando URL do blob anterior:', currentBlobUrlRef.current);
      URL.revokeObjectURL(currentBlobUrlRef.current);
      currentBlobUrlRef.current = null;
    }
  }, []);

  const updatePlayerState = useCallback((updates: Partial<PlayerState>) => {
    setPlayerState(prev => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleLoadStart = () => {
      console.log('🎵 Iniciando carregamento do áudio...');
      updatePlayerState({ isLoading: true, error: null });
    };

    const handleCanPlay = () => {
      console.log('✅ Áudio pode ser reproduzido, duração:', audio.duration);
      updatePlayerState({ 
        isLoading: false,
        duration: audio.duration || 0,
        error: null
      });
    };

    const handleTimeUpdate = () => {
      updatePlayerState({ currentTime: audio.currentTime });
    };

    const handleEnded = () => {
      console.log('🏁 Música terminou');
      updatePlayerState({ isPlaying: false });
    };

    const handleError = (e: Event) => {
      const errorCode = audio.error?.code;
      const errorMessage = audio.error?.message;
      
      console.error('❌ Erro ao carregar áudio:', e);
      console.error('🔍 Código do erro:', errorCode);
      console.error('📝 Mensagem do erro:', errorMessage);
      console.error('🔗 URL atual:', audio.src);
      
      let userFriendlyError = 'Erro ao carregar áudio';
      
      switch (errorCode) {
        case 1:
          userFriendlyError = 'Carregamento cancelado';
          break;
        case 2:
          userFriendlyError = 'Erro de rede';
          break;
        case 3:
          userFriendlyError = 'Formato não suportado';
          break;
        case 4:
          userFriendlyError = 'Arquivo inacessível ou corrompido';
          break;
      }
      
      updatePlayerState({ 
        isLoading: false, 
        isPlaying: false,
        error: userFriendlyError
      });
    };

    const handleCanPlayThrough = () => {
      console.log('🎯 Áudio completamente carregado e pronto');
      updatePlayerState({ isLoading: false, error: null });
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      cleanupBlobUrl();
    };
  }, [updatePlayerState, cleanupBlobUrl]);

  const playSong = useCallback(async (song: Song) => {
    if (!audioRef.current) return;

    console.log('🎵 Tentando reproduzir música:', song.name);
    console.log('🆔 ID do arquivo:', song.id);

    try {
      updatePlayerState({ error: null, isLoading: true });

      if (playerState.currentSong?.id !== song.id) {
        console.log('🔄 Carregando nova música...');
        
        audioRef.current.pause();
        cleanupBlobUrl();
        
        console.log('🔄 Criando blob URL para o arquivo...');
        const blobUrl = await driveService.createAudioBlob(song.id);
        currentBlobUrlRef.current = blobUrl;
        
        audioRef.current.src = blobUrl;
        
        updatePlayerState({ 
          currentSong: song,
          currentTime: 0,
          error: null
        });
        
        console.log('⏳ Aguardando carregamento do áudio...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('▶️ Tentando iniciar reprodução...');
      
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log('✅ Reprodução iniciada com sucesso!');
        updatePlayerState({ isPlaying: true, isLoading: false, error: null });
      }
      
    } catch (error) {
      console.error('❌ Erro ao reproduzir música:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      updatePlayerState({ 
        isPlaying: false, 
        isLoading: false,
        error: `Falha na reprodução: ${errorMessage}`
      });
    }
  }, [playerState.currentSong?.id, updatePlayerState, cleanupBlobUrl, driveService]);

  const pauseSong = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    updatePlayerState({ isPlaying: false });
  }, [updatePlayerState]);

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
    updatePlayerState({ volume });
  }, [updatePlayerState]);

  const seekTo = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    updatePlayerState({ currentTime: time });
  }, [updatePlayerState]);

  return {
    playerState,
    playSong,
    pauseSong,
    togglePlay,
    setVolume,
    seekTo,
  };
};
