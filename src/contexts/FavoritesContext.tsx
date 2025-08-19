import { createContext, useContext, useState, ReactNode } from "react";
import { Song } from "@/services/googleDrive";

export type FavoriteSong = {
  id: string;
  name: string;
  artist?: string;
  albumId: string;
};

type FavoritesContextType = {
  favorites: Song[];
  toggleFavorite: (song: Song) => void;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Song[]>([]);

  const toggleFavorite = (song: Song) => {
    setFavorites((prev) =>
      prev.some((s) => s.id === song.id)
        ? prev.filter((s) => s.id !== song.id)
        : [...prev, song]
    );
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}