
import { Heart } from 'lucide-react';

const FavoritesScreen = () => {
  return (
    <div className="p-4 h-full">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="w-6 h-6 text-red-500" />
        <h2 className="text-xl font-semibold">Favoritos</h2>
      </div>
      
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-400">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-lg mb-2">Nenhuma música favorita</p>
          <p className="text-sm">Adicione músicas aos favoritos para vê-las aqui</p>
        </div>
      </div>
    </div>
  );
};

export default FavoritesScreen;
