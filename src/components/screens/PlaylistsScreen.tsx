
import { List, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PlaylistsScreen = () => {
  return (
    <div className="p-4 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <List className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-semibold">Playlists</h2>
        </div>
        <Button 
          size="sm" 
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          Nova Playlist
        </Button>
      </div>
      
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-400">
          <List className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-lg mb-2">Nenhuma playlist criada</p>
          <p className="text-sm">Crie playlists para organizar suas músicas</p>
        </div>
      </div>
    </div>
  );
};

export default PlaylistsScreen;
