
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useMusicPlayerContext } from '@/contexts/MusicPlayerContext';

const MusicPlayerControls = () => {
  const { playerState, togglePlay, setVolume, seekTo } = useMusicPlayerContext();

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
    <div className="bg-gray-800 border-t border-gray-700 p-4 space-y-3">
      {/* Song info */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded bg-gray-700 flex items-center justify-center flex-shrink-0">
          <span className="text-xs text-gray-400">♪</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white text-sm font-medium truncate">
            {playerState.currentSong.name.replace(/\.(mp3|opus|m4a|flac|wav)$/i, '')}
          </h4>
          {playerState.isLoading && (
            <p className="text-xs text-gray-400">Carregando...</p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <Slider
          value={[playerState.currentTime]}
          max={playerState.duration || 100}
          step={1}
          onValueChange={handleProgressChange}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>{formatTime(playerState.currentTime)}</span>
          <span>{formatTime(playerState.duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button
          onClick={togglePlay}
          disabled={playerState.isLoading}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          {playerState.isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>

        {/* Volume control */}
        <div className="flex items-center gap-2 flex-1 max-w-32 ml-4">
          {playerState.volume === 0 ? (
            <VolumeX className="w-4 h-4 text-gray-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-gray-400" />
          )}
          <Slider
            value={[playerState.volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayerControls;
