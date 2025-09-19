<<<<<<< HEAD
=======

>>>>>>> 82471daca1659d5ebacd200a247d7f245dc4635d
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
<<<<<<< HEAD

=======
  
>>>>>>> 82471daca1659d5ebacd200a247d7f245dc4635d
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

<<<<<<< HEAD
=======
  // Initialize audio element
>>>>>>> 82471daca1659d5ebacd200a247d7f245dc4635d
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
<<<<<<< HEAD
      setPlayerState(prev => ({
        ...prev,
=======
      console.log('✅ Metadados carregados, duração:', audio.duration);
      setPlayerState(prev => ({ 
        ...prev, 
>>>>>>> 82471daca1659d5ebacd200a247d7f245dc4635d
        duration: audio.duration || 0,
        isLoading: false,
        error: null
      }));
    };

    const handleCanPlay = () => {
<<<<<<< HEAD
=======
      console.log('✅ Áudio pode ser reproduzido');
>>>>>>> 82471daca1659d5ebacd200a247d7f245dc4635d
      setPlayerState(prev => ({ ...prev, isLoading: false, error: null }));
    };

    const handleTimeUpdate = () => {
      setPlayerState(prev => ({ ...prev, currentTime: audio.currentTime }));
<<<<<<< HEAD

=======
      
      // Pré-carregamento da próxima música quando restam 15 segundos
>>>>>>> 82471daca1659d5ebacd200a247d7f245dc4635d
      const timeLeft = audio.duration - audio.currentTime;
      if (timeLeft <= 15 && timeLeft > 14.5 && !isPreloadingRef.current) {
        preloadNextSong();
      }
    };

    const handleEnded = () => {
<<<<<<< HEAD
=======
      console.log('🏁 Música terminou');
>>>>>>> 82471daca1659d5ebacd200a247d7f245dc4635d
      setPlayerState(prev => {
        const nextIndex = prev.currentIndex + 1;
        if (nextIndex < prev.currentPlaylist.length) {
          const nextSong = prev.currentPlaylist[nextIndex];
<<<<<<< HEAD
=======
          console.log('🎵 Tocando próxima música:', nextSong.name);
          // A próxima música será tocada pelo useEffect que observa mudanças no currentSong
>>>>>>> 82471daca1659d5ebacd200a247d7f245dc4635d
          return {
            ...prev,
            currentSong: nextSong,
            currentIndex: nextIndex,
<<<<<<< HEAD
            isPlaying: false, // será alterado para true quando a música carregar
=======
            isPlaying: false, // Será alterado para true quando a música carregar
>>>>>>> 82471daca1659d5ebacd200a247d7f245dc4635d
          };
        }
        return { ...prev, isPlaying: false };
      });
    };

    const handleError = (e: Event) => {
<<<<<<< HEAD
      setPlayerState(prev => ({
        ...prev,
        isLoading: false,
=======
      console.error('❌ Erro no áudio:', {
        error: e,
        networkState: audio.networkState,
        readyState: audio.readyState,
        src: audio.src
      });
      
      setPlayerState(prev => ({ 
        ...prev, 
        isLoading: false, 
>>>>>>> 82471daca1659d5ebacd200a247d7f245dc4635d
        isPlaying: false,
        error: 'Erro ao reproduzir arquivo de áudio.'
      }));
    };

    const handleLoadStart = () => {
<<<<<<< HEAD
=======
      console.log('🎵 Iniciando carregamento...');
>>>>>>> 82471daca1659d5ebacd200a247d7f245dc4635d
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
<<<<<<< HEAD

=======
      
      // Limpa blob URLs se existirem
>>>>>>> 82471daca1659d5ebacd200a247d7f245dc4635d
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      }
      if (nextSongBlobUrlRef.current) {
        URL.revokeObjectURL(nextSongBlobUrlRef.current);
      }
    };
<<<<<<< HEAD
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
=======
  }, []);

  // Função para pré-carregar a próxima música
  const preloadNextSong = useCallback(async () => {
    if (isPreloadingRef.current) return;
    
    const nextIndex = playerState.currentIndex + 1;
    if (nextIndex >= playerState.currentPlaylist.length) return;
    
    const nextSong = playerState.currentPlaylist[nextIndex];
    if (!nextSong) return;
    
    isPreloadingRef.current = true;
    console.log('🔄 Pré-carregando próxima música:', nextSong.name);
    
    try {
      // Limpa blob URL anterior da próxima música se existir
>>>>>>> 82471daca1659d5ebacd200a247d7f245dc4635d
      if (nextSongBlobUrlRef.current) {
        URL.revokeObjectURL(nextSongBlobUrlRef.current);
        nextSongBlobUrlRef.current = null;
      }
<<<<<<< HEAD

      const blobUrl = await driveService.downloadFileAsBlob(nextSong.url);
      nextSongBlobUrlRef.current = blobUrl;
    } catch (error) {
      // erro no pré-carregamento
=======
      
      const blobUrl = await driveService.downloadFileAsBlob(nextSong.url);
      nextSongBlobUrlRef.current = blobUrl;
      console.log('✅ Próxima música pré-carregada com sucesso!');
    } catch (error) {
      console.error('⚠️ Erro no pré-carregamento:', error);
>>>>>>> 82471daca1659d5ebacd200a247d7f245dc4635d
    } finally {
      isPreloadingRef.current = false;
    }
  }, [playerState.currentIndex, playerState.currentPlaylist, driveService]);

  const playSong = useCallback(async (song: Song, playlist: Song[] = []) => {
<<<<<<< HEAD
    if (!audioRef.current) return;

    try {
      const currentIndex = playlist.length > 0 ? playlist.findIndex(s => s.id === song.id) : -1;
      setPlayerState(prev => ({
        ...prev,
        error: null,
=======
    if (!audioRef.current) {
      console.error('❌ Audio ref não disponível');
      return;
    }

    console.log('🎵 Reproduzindo:', song.name);
    console.log('📂 ID do arquivo:', song.url);
    
    try {
      const currentIndex = playlist.length > 0 ? playlist.findIndex(s => s.id === song.id) : -1;
      setPlayerState(prev => ({ 
        ...prev, 
        error: null, 
>>>>>>> 82471daca1659d5ebacd200a247d7f245dc4635d
        isLoading: true,
        currentSong: song,
        currentTime: 0,
        currentPlaylist: playlist,
        currentIndex: currentIndex
      }));

<<<<<<< HEAD
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
=======
      // Para a música atual
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      // Limpa blob URL anterior se existir
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
        currentBlobUrlRef.current = null;
      }

      // Verifica se a música já foi pré-carregada
      let blobUrl: string;
      if (nextSongBlobUrlRef.current && song.id === playlist[currentIndex]?.id) {
        console.log('✅ Usando música pré-carregada!');
        blobUrl = nextSongBlobUrlRef.current;
        currentBlobUrlRef.current = blobUrl;
        nextSongBlobUrlRef.current = null;
      } else {
        // Baixa o arquivo e cria blob URL local
        console.log('📥 Iniciando download do arquivo...');
        blobUrl = await driveService.downloadFileAsBlob(song.url);
        currentBlobUrlRef.current = blobUrl;
      }
      
      console.log('🔗 Usando URL local:', blobUrl);
      audioRef.current.src = blobUrl;
      
      // Aguarda o carregamento dos metadados
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
        
        // Timeout de 15 segundos para download
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
>>>>>>> 82471daca1659d5ebacd200a247d7f245dc4635d
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
<<<<<<< HEAD
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
=======
    if (playerState.isPlaying) {
      pauseSong();
    } else if (playerState.currentSong) {
      playSong(playerState.currentSong, playerState.currentPlaylist);
    }
  }, [playerState.isPlaying, playerState.currentSong, playerState.currentPlaylist, pauseSong, playSong]);
>>>>>>> 82471daca1659d5ebacd200a247d7f245dc4635d

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

<<<<<<< HEAD
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
=======
  // Auto-play próxima música quando currentSong muda devido ao handleEnded
  useEffect(() => {
    if (playerState.currentSong && !playerState.isPlaying && !playerState.isLoading && !playerState.error) {
      const autoPlay = async () => {
        try {
          await playSong(playerState.currentSong, playerState.currentPlaylist);
        } catch (error) {
          console.error('Erro no auto-play:', error);
        }
      };
      
      // Pequeno delay para evitar conflitos
      const timeoutId = setTimeout(autoPlay, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [playerState.currentSong, playerState.isPlaying, playerState.isLoading, playerState.error]);
>>>>>>> 82471daca1659d5ebacd200a247d7f245dc4635d

  return {
    playerState,
    playSong,
    pauseSong,
    togglePlay,
    setVolume,
    seekTo,
<<<<<<< HEAD
    playNext,
    playPrev,
  };
};
=======
  };
};
>>>>>>> 82471daca1659d5ebacd200a247d7f245dc4635d
