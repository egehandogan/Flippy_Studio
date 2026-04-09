import { useState } from 'react';
import { AuthService } from '../services/AuthService';
import type { User } from '../services/AuthService';

export function useAuth() {
  const [user, setUser] = useState<User | null>(AuthService.getSession());

  const login = (credentials: any) => {
    const res = AuthService.signIn(credentials);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    window.location.href = '/login';
  };

  return { user, login, logout, isAuthenticated: !!user };
}
