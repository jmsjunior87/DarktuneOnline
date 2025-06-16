
import { Music } from 'lucide-react';

const AlbumsScreen = () => {
  return (
    <div className="p-4 h-full">
      <div className="flex items-center gap-2 mb-6">
        <Music className="w-6 h-6 text-red-500" />
        <h2 className="text-xl font-semibold">Meus Albums</h2>
      </div>
      
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-400">
          <Music className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-lg mb-2">Nenhum album encontrado</p>
          <p className="text-sm">Conecte com o Google Drive para ver seus albums</p>
        </div>
      </div>
    </div>
  );
};

export default AlbumsScreen;
