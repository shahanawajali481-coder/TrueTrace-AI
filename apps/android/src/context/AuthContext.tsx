import React, { createContext, useContext, useState, useEffect } from 'react';
import { androidApi } from '../services/api';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await androidApi.getToken();
        if (token) {
          const profile = await androidApi.getMe();
          setUser(profile);
        }
      } catch (err) {
        await androidApi.setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await androidApi.login(email, pass);
    setUser(res.user);
  };

  const register = async (email: string, pass: string, name: string) => {
    const res = await androidApi.register(email, pass, name);
    setUser(res.user);
  };

  const logout = async () => {
    await androidApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
