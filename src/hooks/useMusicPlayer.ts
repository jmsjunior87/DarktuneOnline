import { useState, useRef, useEffect } from 'react';
import { Song } from '@/services/googleDrive';

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
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    volume: 1,
    currentTime: 0,
    duration: 0,
    isLoading: false,
    error: null,
  });

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
      
      let userFriendlyError = 'Erro desconhecido ao carregar áudio';
      
      switch (errorCode) {
        case 1: // MEDIA_ERR_ABORTED
          userFriendlyError = 'Carregamento do áudio foi cancelado';
          break;
        case 2: // MEDIA_ERR_NETWORK
          userFriendlyError = 'Erro de rede ao carregar áudio';
          break;
        case 3: // MEDIA_ERR_DECODE
          userFriendlyError = 'Erro ao decodificar o arquivo de áudio';
          break;
        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
          userFriendlyError = 'Formato de áudio não suportado ou fonte inacessível';
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
      console.log('🎯 Áudio completamente carregado e pronto para reprodução');
      setPlayerState(prev => ({ ...prev, isLoading: false, error: null }));
    };

    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        console.log('📈 Progresso do buffer:', Math.round((bufferedEnd / audio.duration) * 100) + '%');
      }
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('progress', handleProgress);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('progress', handleProgress);
      audio.pause();
    };
  }, []);

  const playSong = async (song: Song) => {
    if (!audioRef.current) return;

    console.log('🎵 Tentando reproduzir música:', song.name);
    console.log('🔗 URL:', song.url);

    try {
      // Sempre resetar o estado de erro ao tentar uma nova música
      setPlayerState(prev => ({ ...prev, error: null }));

      if (playerState.currentSong?.id !== song.id) {
        console.log('🔄 Carregando nova música...');
        
        // Pausar a música atual se estiver tocando
        audioRef.current.pause();
        
        // Definir nova fonte
        audioRef.current.src = song.url;
        
        setPlayerState(prev => ({ 
          ...prev, 
          currentSong: song,
          currentTime: 0,
          isLoading: true,
          error: null
        }));
        
        // Aguardar um pouco para o arquivo começar a carregar
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('▶️ Tentando iniciar reprodução...');
      
      // Tentar reproduzir
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log('✅ Reprodução iniciada com sucesso!');
        setPlayerState(prev => ({ ...prev, isPlaying: true, error: null }));
      }
      
    } catch (error) {
      console.error('❌ Erro ao reproduzir música:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setPlayerState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        isLoading: false,
        error: `Erro de reprodução: ${errorMessage}`
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
