
import { Music, Heart, List, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationBarProps {
  activeScreen: string;
  onScreenChange: (screen: string) => void;
}

const NavigationBar = ({ activeScreen, onScreenChange }: NavigationBarProps) => {
  const navItems = [
    { id: 'albums', label: 'Albums', icon: Music },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'playlists', label: 'Playlists', icon: List },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="bg-gray-800 border-t border-gray-700 px-4 py-2">
      <div className="flex justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onScreenChange(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-red-500 bg-red-500/10' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};

export default NavigationBar;
