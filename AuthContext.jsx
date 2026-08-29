import React, { createContext, useState, useContext, useEffect } from 'react';
import { appParams } from '@/lib/app-params';

const db = globalThis.__B44_DB__ || {
  auth: {
    isAuthenticated: async () => false,
    me: async () => null,
    logout: () => {},
    redirectToLogin: () => {}
  },
  entities: new Proxy({}, {
    get: () => ({
      filter: async () => [],
      get: async () => null,
      create: async () => ({}),
      update: async () => ({}),
      delete: async () => ({})
    })
  }),
  integrations: {
    Core: {
      UploadFile: async () => ({ file_url: '' }),
      InvokeLLM: async ({ prompt }) => ({ response: `Assistant: Réponse à votre message : "${prompt}"` }),
      GenerateImage: async ({ prompt }) => ({ url: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80` })
    }
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('app_user');
      return stored ? JSON.parse(stored) : { id: 'guest', name: 'Utilisateur', email: 'user@eclat-bfc.fr' };
    } catch {
      return { id: 'guest', name: 'Utilisateur', email: 'user@eclat-bfc.fr' };
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(true);
  const [appPublicSettings, setAppPublicSettings] = useState({ id: 'standalone', public_settings: {} });

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      if (globalThis.__B44_DB__ && typeof globalThis.__B44_DB__.auth?.me === 'function') {
        const currentUser = await globalThis.__B44_DB__.auth.me();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.warn('Auth check skipped / standalone mode:', error);
    } finally {
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const checkUserAuth = async () => {
    try {
      if (globalThis.__B44_DB__ && typeof globalThis.__B44_DB__.auth?.me === 'function') {
        const currentUser = await globalThis.__B44_DB__.auth.me();
        setUser(currentUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.warn('User auth check failed:', error);
    }
  };

  const logout = (shouldRedirect = false) => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('app_user');
    if (shouldRedirect) {
      window.location.href = '/';
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
