import { useState, useRef, useEffect } from 'react';
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

  // Função para limpar URL do blob anterior
  const cleanupBlobUrl = () => {
    if (currentBlobUrlRef.current) {
      console.log('🧹 Limpando URL do blob anterior:', currentBlobUrlRef.current);
      URL.revokeObjectURL(currentBlobUrlRef.current);
      currentBlobUrlRef.current = null;
    }
  };

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleLoadStart = () => {
      console.log('🎵 Iniciando carregamento do áudio...');
      setPlayerState(prev => ({ ...prev, isLoading: true, error: null }));
    };

    const handleCanPlay = () => {
      console.log('✅ Áudio pode ser reproduzido, duração:', audio.duration);
      setPlayerState(prev => ({ 
        ...prev, 
        isLoading: false,
        duration: audio.duration || 0,
        error: null
      }));
    };

    const handleTimeUpdate = () => {
      setPlayerState(prev => ({ 
        ...prev, 
        currentTime: audio.currentTime 
      }));
    };

    const handleEnded = () => {
      console.log('🏁 Música terminou');
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
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
        case 1: // MEDIA_ERR_ABORTED
          userFriendlyError = 'Carregamento cancelado';
          break;
        case 2: // MEDIA_ERR_NETWORK
          userFriendlyError = 'Erro de rede';
          break;
        case 3: // MEDIA_ERR_DECODE
          userFriendlyError = 'Formato não suportado';
          break;
        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
          userFriendlyError = 'Arquivo inacessível ou corrompido';
          break;
      }
      
      setPlayerState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isPlaying: false,
        error: userFriendlyError
      }));
    };

    const handleLoadedData = () => {
      console.log('📊 Dados do áudio carregados');
    };

    const handleCanPlayThrough = () => {
      console.log('🎯 Áudio completamente carregado e pronto');
      setPlayerState(prev => ({ ...prev, isLoading: false, error: null }));
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      cleanupBlobUrl();
    };
  }, []);

  const playSong = async (song: Song) => {
    if (!audioRef.current) return;

    console.log('🎵 Tentando reproduzir música:', song.name);
    console.log('🆔 ID do arquivo:', song.id);

    try {
      setPlayerState(prev => ({ ...prev, error: null, isLoading: true }));

      if (playerState.currentSong?.id !== song.id) {
        console.log('🔄 Carregando nova música...');
        
        // Pausar e limpar áudio atual
        audioRef.current.pause();
        cleanupBlobUrl();
        
        // Criar blob URL para o arquivo
        console.log('🔄 Criando blob URL para o arquivo...');
        const blobUrl = await driveService.createAudioBlob(song.id);
        currentBlobUrlRef.current = blobUrl;
        
        // Definir nova fonte
        audioRef.current.src = blobUrl;
        
        setPlayerState(prev => ({ 
          ...prev, 
          currentSong: song,
          currentTime: 0,
          error: null
        }));
        
        console.log('⏳ Aguardando carregamento do áudio...');
        
        // Aguardar um pouco para o arquivo carregar
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('▶️ Tentando iniciar reprodução...');
      
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log('✅ Reprodução iniciada com sucesso!');
        setPlayerState(prev => ({ ...prev, isPlaying: true, isLoading: false, error: null }));
      }
      
    } catch (error) {
      console.error('❌ Erro ao reproduzir música:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setPlayerState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        isLoading: false,
        error: `Falha na reprodução: ${errorMessage}`
      }));
    }
  };

  const pauseSong = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setPlayerState(prev => ({ ...prev, isPlaying: false }));
  };

  const togglePlay = () => {
    if (playerState.isPlaying) {
      pauseSong();
    } else if (playerState.currentSong) {
      playSong(playerState.currentSong);
    }
  };

  const setVolume = (volume: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    setPlayerState(prev => ({ ...prev, volume }));
  };

  const seekTo = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setPlayerState(prev => ({ ...prev, currentTime: time }));
  };

  return {
    playerState,
    playSong,
    pauseSong,
    togglePlay,
    setVolume,
    seekTo,
  };
};
