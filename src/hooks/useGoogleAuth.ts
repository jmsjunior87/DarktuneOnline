
import { useState, useEffect } from 'react';
import { GoogleAuthService, GoogleUser } from '@/services/googleAuth';
import { useToast } from '@/hooks/use-toast';

export const useGoogleAuth = () => {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  
  const authService = GoogleAuthService.getInstance();

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsInitialized(true);
  }, []);

  const signIn = async () => {
    setIsLoading(true);
    try {
      const user = await authService.signIn();
      setUser(user);
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${user.name}!`,
      });
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro no login",
        description: "Não foi possível fazer login com Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    isInitialized,
    isSignedIn: !!user,
    signIn,
    signOut
  };
};
