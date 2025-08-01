import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MusicPlayerProvider } from "@/contexts/MusicPlayerContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext"; // ADICIONE ESTA LINHA
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  console.log('🚀 App inicializando...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <MusicPlayerProvider>
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
      </MusicPlayerProvider>
    </QueryClientProvider>
  );
};

export default App;
