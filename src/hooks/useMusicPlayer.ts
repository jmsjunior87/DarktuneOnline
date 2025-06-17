
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
    audioRef.current = audio;

    const handleLoadStart = () => {
      setPlayerState(prev => ({ ...prev, isLoading: true }));
    };

    const handleCanPlay = () => {
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

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  const playSong = (song: Song) => {
    if (!audioRef.current) return;

    console.log('Reproduzindo música:', song.name);
    console.log('URL:', song.url);

    if (playerState.currentSong?.id !== song.id) {
      audioRef.current.src = song.url;
      setPlayerState(prev => ({ 
        ...prev, 
        currentSong: song,
        currentTime: 0 
      }));
    }

    audioRef.current.play();
    setPlayerState(prev => ({ ...prev, isPlaying: true }));
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
