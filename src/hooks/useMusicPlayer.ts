
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
      
      // Pré-carregamento da próxima música quando restam 15 segundos
      const timeLeft = audio.duration - audio.currentTime;
      if (timeLeft <= 15 && timeLeft > 14.5 && !isPreloadingRef.current) {
        preloadNextSong();
      }
    };

    const handleEnded = () => {
      console.log('🏁 Música terminou');
      setPlayerState(prev => {
        const nextIndex = prev.currentIndex + 1;
        if (nextIndex < prev.currentPlaylist.length) {
          const nextSong = prev.currentPlaylist[nextIndex];
          console.log('🎵 Tocando próxima música:', nextSong.name);
          // A próxima música será tocada pelo useEffect que observa mudanças no currentSong
          return {
            ...prev,
            currentSong: nextSong,
            currentIndex: nextIndex,
            isPlaying: false, // Será alterado para true quando a música carregar
          };
        }
        return { ...prev, isPlaying: false };
      });
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
      
      // Limpa blob URLs se existirem
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      }
      if (nextSongBlobUrlRef.current) {
        URL.revokeObjectURL(nextSongBlobUrlRef.current);
      }
    };
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
      if (nextSongBlobUrlRef.current) {
        URL.revokeObjectURL(nextSongBlobUrlRef.current);
        nextSongBlobUrlRef.current = null;
      }
      
      const blobUrl = await driveService.downloadFileAsBlob(nextSong.url);
      nextSongBlobUrlRef.current = blobUrl;
      console.log('✅ Próxima música pré-carregada com sucesso!');
    } catch (error) {
      console.error('⚠️ Erro no pré-carregamento:', error);
    } finally {
      isPreloadingRef.current = false;
    }
  }, [playerState.currentIndex, playerState.currentPlaylist, driveService]);

  const playSong = useCallback(async (song: Song, playlist: Song[] = []) => {
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
        isLoading: true,
        currentSong: song,
        currentTime: 0,
        currentPlaylist: playlist,
        currentIndex: currentIndex
      }));

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
    if (playerState.isPlaying) {
      pauseSong();
    } else if (playerState.currentSong) {
      playSong(playerState.currentSong, playerState.currentPlaylist);
    }
  }, [playerState.isPlaying, playerState.currentSong, playerState.currentPlaylist, pauseSong, playSong]);

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

  return {
    playerState,
    playSong,
    pauseSong,
    togglePlay,
    setVolume,
    seekTo,
  };
};
