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
  currentPlaylist: Song[];
  currentIndex: number;
}

export const useMusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const driveService = GoogleDriveService.getInstance();
  const currentBlobUrlRef = useRef<string | null>(null);
  const nextSongBlobUrlRef = useRef<string | null>(null);
  const isPreloadingRef = useRef(false);

  const [playerState, setPlayerState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    volume: 1,
    currentTime: 0,
    duration: 0,
    isLoading: false,
    error: null,
    currentPlaylist: [],
    currentIndex: -1,
  });

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setPlayerState(prev => ({
        ...prev,
        duration: audio.duration || 0,
        isLoading: false,
        error: null
      }));
    };

    const handleCanPlay = () => {
      setPlayerState(prev => ({ ...prev, isLoading: false, error: null }));
    };

    const handleTimeUpdate = () => {
      setPlayerState(prev => ({ ...prev, currentTime: audio.currentTime }));

      const timeLeft = audio.duration - audio.currentTime;
      if (timeLeft <= 15 && timeLeft > 14.5 && !isPreloadingRef.current) {
        preloadNextSong();
      }
    };

    const handleEnded = () => {
      setPlayerState(prev => {
        const nextIndex = prev.currentIndex + 1;
        if (nextIndex < prev.currentPlaylist.length) {
          const nextSong = prev.currentPlaylist[nextIndex];
          return {
            ...prev,
            currentSong: nextSong,
            currentIndex: nextIndex,
            isPlaying: false, // será alterado para true quando a música carregar
          };
        }
        return { ...prev, isPlaying: false };
      });
    };

    const handleError = (e: Event) => {
      setPlayerState(prev => ({
        ...prev,
        isLoading: false,
        isPlaying: false,
        error: 'Erro ao reproduzir arquivo de áudio.'
      }));
    };

    const handleLoadStart = () => {
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
      if (nextSongBlobUrlRef.current) {
        URL.revokeObjectURL(nextSongBlobUrlRef.current);
      }
    };
    // eslint-disable-next-line
  }, []);

  const preloadNextSong = useCallback(async () => {
    if (isPreloadingRef.current) return;

    const nextIndex = playerState.currentIndex + 1;
    if (nextIndex >= playerState.currentPlaylist.length) return;

    const nextSong = playerState.currentPlaylist[nextIndex];
    if (!nextSong) return;

    isPreloadingRef.current = true;

    try {
      if (nextSongBlobUrlRef.current) {
        URL.revokeObjectURL(nextSongBlobUrlRef.current);
        nextSongBlobUrlRef.current = null;
      }

      const blobUrl = await driveService.downloadFileAsBlob(nextSong.url);
      nextSongBlobUrlRef.current = blobUrl;
    } catch (error) {
      // erro no pré-carregamento
    } finally {
      isPreloadingRef.current = false;
    }
  }, [playerState.currentIndex, playerState.currentPlaylist, driveService]);

  const playSong = useCallback(async (song: Song, playlist: Song[] = []) => {
    if (!audioRef.current) return;

    try {
      const currentIndex = playlist.length > 0 ? playlist.findIndex(s => s.id === song.id) : -1;
      setPlayerState(prev => ({
        ...prev,
        error: null,
        isLoading: true,
        currentSong: song,
        currentTime: 0,
        currentPlaylist: playlist,
        currentIndex: currentIndex
      }));

      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      let blobUrl: string; // <-- MOVA ESTA LINHA PARA CIMA
      let triedDownload = false;
      let oldBlobUrl = currentBlobUrlRef.current;

      while (true) {
        try {
          if (nextSongBlobUrlRef.current && song.id === playlist[currentIndex]?.id) {
            blobUrl = nextSongBlobUrlRef.current;
            currentBlobUrlRef.current = blobUrl;
            nextSongBlobUrlRef.current = null;
          } else {
            blobUrl = await driveService.downloadFileAsBlob(song.url);
            currentBlobUrlRef.current = blobUrl;
          }

          audioRef.current.src = blobUrl;

          await new Promise((resolve, reject) => {
            const handleCanPlay = () => {
              audioRef.current?.removeEventListener('canplay', handleCanPlay);
              audioRef.current?.removeEventListener('error', handleError);

              // Troque o revoke direto por este com delay:
              if (oldBlobUrl && oldBlobUrl !== blobUrl) {
                setTimeout(() => URL.revokeObjectURL(oldBlobUrl!), 500);
              }

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
          setPlayerState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
          break; // Sucesso, sai do loop

        } catch (error) {
          if (triedDownload) {
            throw error;
          }
          driveService.clearBlobCache(song.url);
          triedDownload = true;
        }
      }

    } catch (error) {
      setPlayerState(prev => ({
        ...prev,
        isPlaying: false,
        isLoading: false,
        error: 'Não foi possível baixar ou reproduzir este arquivo. Verifique se o arquivo está acessível no Google Drive.'
      }));
    }
  }, [driveService]);

  const pauseSong = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setPlayerState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (playerState.isPlaying) {
      audioRef.current.pause();
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
    } else if (playerState.currentSong) {
      // Se já está carregada e só está pausada, só dá play
      if (audioRef.current.src && !playerState.isLoading && playerState.currentTime > 0) {
        audioRef.current.play();
        setPlayerState(prev => ({ ...prev, isPlaying: true }));
      } else {
        // Se não, carrega do zero
        playSong(playerState.currentSong, playerState.currentPlaylist);
      }
    }
  }, [
    playerState.isPlaying,
    playerState.currentSong,
    playerState.currentPlaylist,
    playerState.isLoading,
    playerState.currentTime,
    playSong
  ]);

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

  // Função para tocar a próxima música da playlist
  const playNext = useCallback(() => {
    if (
      playerState.currentPlaylist.length > 0 &&
      playerState.currentIndex < playerState.currentPlaylist.length - 1
    ) {
      const nextSong = playerState.currentPlaylist[playerState.currentIndex + 1];
      playSong(nextSong, playerState.currentPlaylist);
    }
  }, [playerState.currentPlaylist, playerState.currentIndex, playSong]);

  // Função para tocar a música anterior da playlist
  const playPrev = useCallback(() => {
    if (
      playerState.currentPlaylist.length > 0 &&
      playerState.currentIndex > 0
    ) {
      const prevSong = playerState.currentPlaylist[playerState.currentIndex - 1];
      playSong(prevSong, playerState.currentPlaylist);
    }
  }, [playerState.currentPlaylist, playerState.currentIndex, playSong]);

  useEffect(() => {
    // Só faz autoplay se a música mudou por término da anterior
    if (
      playerState.currentSong &&
      !playerState.isPlaying &&
      !playerState.isLoading &&
      !playerState.error
    ) {
      playSong(playerState.currentSong, playerState.currentPlaylist);
    }
    // eslint-disable-next-line
  }, [playerState.currentSong]);

  return {
    playerState,
    playSong,
    pauseSong,
    togglePlay,
    setVolume,
    seekTo,
    playNext,
    playPrev,
  };
};