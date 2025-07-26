import { useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, AlertCircle, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useMusicPlayerContext } from '@/contexts/MusicPlayerContext';

const MusicPlayerControls = () => {
  const { playerState, togglePlay, setVolume, seekTo, playNext, playPrev } = useMusicPlayerContext();

  
  useEffect(() => {
    if (playerState.currentSong) {
      const songName = playerState.currentSong.name.replace(/\.(mp3|opus|m4a|flac|wav)$/i, '');
      const artist = playerState.currentSong.artist ? ` - ${playerState.currentSong.artist}` : '';
      document.title = `${songName}${artist}`;
    } else {
      document.title = "DarkTune";
    }
  }, [playerState.currentSong]);

  if (!playerState.currentSong) {
    return null;
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (value: number[]) => {
    seekTo(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  return (
    <div className="bg-gray-800 border-t border-gray-700 p-2 space-y-2">
      {/* Song info + Progress bar na mesma linha */}
      <div className="flex items-center gap-3 w-full max-w-xl mx-auto">
        {/* Quadrado (imagem ou ícone) */}
        <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center flex-shrink-0">
          <span className="text-xs text-gray-400">♪</span>
        </div>
        {/* Título/artista */}
        <div className="min-w-0 flex-shrink-0">
          <h4 className="text-white text-xs font-medium truncate max-w-[140px]">
            {playerState.currentSong.name.replace(/\.(mp3|opus|m4a|flac|wav)$/i, '')}
            {playerState.currentSong.artist && (
              <span className="text-gray-400"> - {playerState.currentSong.artist}</span>
            )}
          </h4>
          {playerState.isLoading && (
            <p className="text-[10px] text-gray-400">Carregando...</p>
          )}
          {playerState.error && (
            <div className="flex items-center gap-1 text-[10px] text-red-400">
              <AlertCircle className="w-3 h-3" />
              <span className="truncate">{playerState.error}</span>
            </div>
          )}
        </div>
        {/* Barra de progresso ocupa o restante */}
        <div className="flex-1 min-w-0">
          <Slider
            value={[playerState.currentTime]}
            max={playerState.duration || 100}
            step={1}
            onValueChange={handleProgressChange}
            className="w-full h-2"
            disabled={playerState.error !== null}
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>{formatTime(playerState.currentTime)}</span>
            <span>{formatTime(playerState.duration)}</span>
          </div>
        </div>
      </div>

      {/* Controls centered, volume right */}
      <div className="flex items-center justify-between gap-2">
        {/* Centraliza os controles */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              onClick={playPrev}
              disabled={playerState.isLoading || playerState.error !== null}
              className="bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-600 p-1 h-7 w-7"
              aria-label="Anterior"
            >
              <SkipBack className="w-3 h-3" />
            </Button>
            <Button
              onClick={togglePlay}
              disabled={playerState.isLoading || playerState.error !== null}
              className="bg-red-500 hover:bg-red-600 text-white disabled:bg-gray-600 p-1 h-8 w-8"
              aria-label="Play/Pause"
            >
              {playerState.isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            <Button
              onClick={playNext}
              disabled={playerState.isLoading || playerState.error !== null}
              className="bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-600 p-1 h-7 w-7"
              aria-label="Próxima"
            >
              <SkipForward className="w-3 h-3" />
            </Button>
          </div>
        </div>
        {/* Volume control alinhado à direita */}
        <div className="flex items-center gap-1 max-w-24 w-full justify-end">
          {playerState.volume === 0 ? (
            <VolumeX className="w-3 h-3 text-gray-400" />
          ) : (
            <Volume2 className="w-3 h-3 text-gray-400" />
          )}
          <Slider
            value={[playerState.volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="flex-1 h-2"
          />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayerControls;
