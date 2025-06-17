
import { useState, useRef, useEffect } from 'react';
import { Song } from '@/services/googleDrive';

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isLoading: boolean;
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
  });

  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const handleLoadStart = () => {
      console.log('Iniciando carregamento do áudio...');
      setPlayerState(prev => ({ ...prev, isLoading: true }));
    };

    const handleCanPlay = () => {
      console.log('Áudio pode ser reproduzido, duração:', audio.duration);
      setPlayerState(prev => ({ 
        ...prev, 
        isLoading: false,
        duration: audio.duration || 0 
      }));
    };

    const handleTimeUpdate = () => {
      setPlayerState(prev => ({ 
        ...prev, 
        currentTime: audio.currentTime 
      }));
    };

    const handleEnded = () => {
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
    };

    const handleError = (e: Event) => {
      console.error('Erro ao carregar áudio:', e);
      setPlayerState(prev => ({ ...prev, isLoading: false, isPlaying: false }));
    };

    const handleLoadedData = () => {
      console.log('Dados do áudio carregados');
      setPlayerState(prev => ({ ...prev, isLoading: false }));
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  const playSong = async (song: Song) => {
    if (!audioRef.current) return;

    console.log('Reproduzindo música:', song.name);
    console.log('URL:', song.url);

    try {
      if (playerState.currentSong?.id !== song.id) {
        audioRef.current.src = song.url;
        setPlayerState(prev => ({ 
          ...prev, 
          currentSong: song,
          currentTime: 0,
          isLoading: true
        }));
      }

      await audioRef.current.play();
      setPlayerState(prev => ({ ...prev, isPlaying: true }));
    } catch (error) {
      console.error('Erro ao reproduzir música:', error);
      setPlayerState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
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
