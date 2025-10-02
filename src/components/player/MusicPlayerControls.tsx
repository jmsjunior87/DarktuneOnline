import { useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, AlertCircle, SkipBack, SkipForward, Music } from 'lucide-react';
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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95vw] max-w-4xl rounded-xl shadow-lg backdrop-blur-md bg-black/60 border border-gray-700 px-6 py-3 z-50 flex items-center gap-6">
      {/* Miniatura + info (esquerda) */}
      <div className="flex items-center gap-3 min-w-0 flex-shrink-0 w-1/3">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0 flex items-center justify-center">
          {playerState.currentSong.coverUrl ? (
            <img
              src={playerState.currentSong.coverUrl}
              alt={playerState.currentSong.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Music className="w-6 h-6 text-gray-400" />
          )}
        </div>
        <div className="min-w-0">
          <h4 className="text-white text-sm font-medium truncate max-w-[160px]">
            {playerState.currentSong.name.replace(/\.(mp3|opus|m4a|flac|wav)$/i, '')}
            {playerState.currentSong.artist && (
              <span className="text-gray-400"> - {playerState.currentSong.artist}</span>
            )}
          </h4>
          {playerState.isLoading && (
            <p className="text-xs text-gray-400">Carregando...</p>
          )}
          {playerState.error && (
            <div className="flex items-center gap-1 text-xs text-red-400">
              <AlertCircle className="w-3 h-3" />
              <span className="truncate">{playerState.error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Barra de progresso centralizada */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <Slider
          value={[playerState.currentTime]}
          max={playerState.duration || 100}
          step={1}
          onValueChange={handleProgressChange}
          className="w-full h-2"
          disabled={playerState.error !== null}
        />
        <div className="flex justify-between w-full text-xs text-gray-400 mt-1">
          <span>{formatTime(playerState.currentTime)}</span>
          <span>{formatTime(playerState.duration)}</span>
        </div>
      </div>

      {/* Controles (direita) */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          onClick={playPrev}
          disabled={playerState.isLoading || playerState.error !== null}
          className="bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-600 p-1 h-8 w-8"
          aria-label="Anterior"
        >
          <SkipBack className="w-4 h-4" />
        </Button>
        <Button
          onClick={togglePlay}
          disabled={playerState.isLoading || playerState.error !== null}
          className="bg-red-500 hover:bg-red-600 text-white disabled:bg-gray-600 p-1 h-10 w-10"
          aria-label="Play/Pause"
        >
          {playerState.isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </Button>
        <Button
          onClick={playNext}
          disabled={playerState.isLoading || playerState.error !== null}
          className="bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-600 p-1 h-8 w-8"
          aria-label="Próxima"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
        {/* Controle de volume */}
        <div className="flex items-center gap-2 ml-4 w-24">
          {playerState.volume === 0 ? (
            <VolumeX className="w-5 h-5 text-gray-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-gray-400" />
          )}
          <Slider
            value={[playerState.volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-16 h-2"
          />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayerControls;