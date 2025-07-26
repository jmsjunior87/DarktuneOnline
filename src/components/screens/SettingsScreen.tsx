
import { Settings, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SettingsScreen = () => {
  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6 text-red-500" />
        <h2 className="text-xl font-semibold">Configurações</h2>
      </div>
      
      <div className="space-y-4 max-w-md mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-red-500" />
              <CardTitle className="text-white">Sobre o DarkTune</CardTitle>
            </div>
            <CardDescription className="text-gray-400">
              Informações sobre o aplicativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-400">
              <p><strong className="text-white">Versão:</strong> 1.0.0</p>
              <p><strong className="text-white">Desenvolvido por:</strong> DarkTune Team</p>
              <p className="mt-4">
                DarkTune é um aplicativo de streaming de música que conecta 
                diretamente com seu Google Drive para reproduzir suas músicas 
                pessoais com uma interface elegante e escura.
              </p>
              <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-300">
                  <strong>Como funciona:</strong> O app acessa uma pasta "Albums" específica 
                  no Google Drive. Dentro dela, cada subpasta representa um álbum com as 
                  músicas e um arquivo "cover.jpg" como capa.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsScreen;
