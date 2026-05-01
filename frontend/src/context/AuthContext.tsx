import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import api from '../api/axios';

interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (body: Record<string, any>) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('agro_token');
    const storedUser = localStorage.getItem('agro_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const _persist = (token: string, user: User) => {
    localStorage.setItem('agro_token', token);
    localStorage.setItem('agro_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    _persist(data.token, data.user);
  };

  const register = async (body: Record<string, any>) => {
    const { data } = await api.post('/auth/register', body);
    _persist(data.token, data.user);
  };

  const logout = () => {
    localStorage.removeItem('agro_token');
    localStorage.removeItem('agro_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
