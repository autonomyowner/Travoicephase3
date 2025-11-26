'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  User,
  getSession,
  login as authLogin,
  signup as authSignup,
  logout as authLogout,
  upgradeToPro as authUpgrade,
  getRemainingAnalyses,
} from '@/lib/auth';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  remainingAnalyses: number;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, prenom: string) => Promise<void>;
  logout: () => void;
  upgradeToPro: () => Promise<void>;
  refreshUser: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [remainingAnalyses, setRemainingAnalyses] = useState(0);

  const refreshUser = useCallback(() => {
    const session = getSession();
    setUser(session?.user ?? null);
    setRemainingAnalyses(getRemainingAnalyses());
  }, []);

  useEffect(() => {
    refreshUser();
    setIsLoading(false);
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loggedInUser = await authLogin(email, password);
      setUser(loggedInUser);
      setRemainingAnalyses(getRemainingAnalyses());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(
    async (email: string, password: string, prenom: string) => {
      setIsLoading(true);
      try {
        const newUser = await authSignup(email, password, prenom);
        setUser(newUser);
        setRemainingAnalyses(getRemainingAnalyses());
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
    setRemainingAnalyses(0);
  }, []);

  const upgradeToPro = useCallback(async () => {
    setIsLoading(true);
    try {
      const updatedUser = await authUpgrade();
      setUser(updatedUser);
      setRemainingAnalyses(getRemainingAnalyses());
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    remainingAnalyses,
    login,
    signup,
    logout,
    upgradeToPro,
    refreshUser,
  };
}
