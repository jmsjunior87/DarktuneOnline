
import { useState, useMemo } from 'react';
import { Album, Song } from '@/services/googleDrive';

export interface SearchResult {
  type: 'album' | 'song';
  album?: Album;
  song?: Song;
  matchedFields: string[];
}

export const useSearch = (albums: Album[]) => {
  const [searchTerm, setSearchTerm] = useState('');

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      return [];
    }

    const results: SearchResult[] = [];
    const term = searchTerm.toLowerCase().trim();

    // Buscar em álbuns
    albums.forEach(album => {
      const matchedFields: string[] = [];
      
      if (album.name.toLowerCase().includes(term)) {
        matchedFields.push('album');
      }

      // Verificar se alguma música do álbum corresponde
      const matchingSongs = album.songs.filter(song => {
        return song.name.toLowerCase().includes(term) || 
               (song.artist && song.artist.toLowerCase().includes(term));
      });

      if (matchingSongs.length > 0) {
        matchedFields.push('songs');
      }

      if (matchedFields.length > 0) {
        results.push({
          type: 'album',
          album,
          matchedFields
        });
      }

      // Adicionar músicas individuais que correspondem
      matchingSongs.forEach(song => {
        const songMatchedFields: string[] = [];
        
        if (song.name.toLowerCase().includes(term)) {
          songMatchedFields.push('title');
        }
        
        if (song.artist && song.artist.toLowerCase().includes(term)) {
          songMatchedFields.push('artist');
        }

        results.push({
          type: 'song',
          song,
          matchedFields: songMatchedFields
        });
      });
    });

    return results;
  }, [albums, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    hasResults: searchResults.length > 0
  };
};
