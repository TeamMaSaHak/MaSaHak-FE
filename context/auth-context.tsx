import React, { createContext, useContext, useState, useEffect } from "react";
import { getAccessToken, onAuthFailure } from "../services/api-client";
import { verifyMember, logout as logoutApi, UserInfo } from "../services/auth";
import { registerPushToken } from "../services/push";

interface AuthState {
  isLoading: boolean;
  isLoggedIn: boolean;
  user: UserInfo | null;
  login: (user: UserInfo) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthState>({
  isLoading: true,
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: async () => {},
  checkAuth: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  const checkAuth = async (): Promise<boolean> => {
    const token = await getAccessToken();
    if (!token) {
      setIsLoggedIn(false);
      setUser(null);
      setIsLoading(false);
      return false;
    }

    const res = await verifyMember();
    if (res.success && res.data?.isMember) {
      setUser(res.data.user);
      setIsLoggedIn(true);
      setIsLoading(false);
      registerPushToken().catch(() => {});
      return true;
    }

    setIsLoggedIn(false);
    setUser(null);
    setIsLoading(false);
    return false;
  };

  const login = (userInfo: UserInfo) => {
    setUser(userInfo);
    setIsLoggedIn(true);
    registerPushToken().catch(() => {});
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
    setIsLoggedIn(false);
  };

  useEffect(() => {
    checkAuth();
    const off = onAuthFailure(() => {
      setUser(null);
      setIsLoggedIn(false);
    });
    return off;
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLoading, isLoggedIn, user, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
