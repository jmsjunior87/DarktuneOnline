<<<<<<< HEAD
=======

>>>>>>> 82471daca1659d5ebacd200a247d7f245dc4635d
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MusicPlayerProvider } from "@/contexts/MusicPlayerContext";
<<<<<<< HEAD
import { FavoritesProvider } from "@/contexts/FavoritesContext"; // ADICIONE ESTA LINHA
=======
>>>>>>> 82471daca1659d5ebacd200a247d7f245dc4635d
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  console.log('🚀 App inicializando...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <MusicPlayerProvider>
<<<<<<< HEAD
        <FavoritesProvider> {/* ENVOLVA AQUI */}
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </FavoritesProvider>
=======
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
>>>>>>> 82471daca1659d5ebacd200a247d7f245dc4635d
      </MusicPlayerProvider>
    </QueryClientProvider>
  );
};

export default App;
