
import { Settings, Info, User, LogOut } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

const SettingsScreen = () => {
  const { user, isSignedIn, signOut, isLoading } = useGoogleAuth();

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
              <User className="w-5 h-5 text-red-500" />
              <CardTitle className="text-white">Conta</CardTitle>
            </div>
            <CardDescription className="text-gray-400">
              {isSignedIn ? 'Sua conta Google conectada' : 'Gerenciar sua conta e preferências'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSignedIn && user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={user.picture} 
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                </div>
                <Button 
                  onClick={signOut}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {isLoading ? 'Desconectando...' : 'Desconectar'}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Faça login com Google para acessar suas músicas
              </p>
            )}
          </CardContent>
        </Card>

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
                  <strong>Como usar:</strong> Crie uma pasta "Albums" na raiz do seu Google Drive. 
                  Dentro dela, crie uma subpasta para cada álbum com as músicas e um arquivo "cover.jpg" como capa.
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
