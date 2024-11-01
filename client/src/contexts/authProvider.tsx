/* eslint-disable react-refresh/only-export-components */
import { useContext, createContext, useState, useEffect } from "react";
import { registerUser, loginUser, logoutUser, refreshTokens } from "@/api/auth";
import type { TLoginFormSchema, TRegisterFormSchema } from "@/types/forms";
import { USER_STORAGE_KEY } from "@/constants";

interface AuthProviderState {
  user: string | null;
  registerUser: (data: TRegisterFormSchema) => void | Promise<void>;
  loginUser: (data: TLoginFormSchema) => void | Promise<void>;
  refreshTokens: () => void | Promise<void>;
  logoutUser: () => void | Promise<void>;
}

const initialState: AuthProviderState = {
  user: null,
  registerUser: () => console.error("registerUser not implemented"),
  loginUser: () => console.error("loginUser not implemented"),
  refreshTokens: () => console.error("refreshTokens not implemented"),
  logoutUser: () => console.error("logoutUser not implemented"),
};

let didInit = false;

const AuthProviderContext = createContext<AuthProviderState>(initialState);

export function AuthProvider({ children, ...props }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(localStorage.getItem(USER_STORAGE_KEY));

  const handleRegister = async (data: TRegisterFormSchema) => {
    await registerUser(data);
  };

  const handleLogin = async (data: TLoginFormSchema) => {
    const username = await loginUser(data);
    setUser(username);
    localStorage.setItem(USER_STORAGE_KEY, username);
  };

  const handleLogout = async () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    await logoutUser();
  };

  const handleRefreshingTokens = async () => {
    const username = await refreshTokens();
    setUser(username);
    localStorage.setItem(USER_STORAGE_KEY, username);
  };

  useEffect(() => {
    if (!user)
      return;

    if (!didInit) {
      didInit = true;
      void refreshTokens();
    } else {
      const interval  = setInterval(() => {
        void refreshTokens();
      }, 1500000); // 25 minutes
      return () => clearInterval(interval);
    }
  }, [user]);

  const value: AuthProviderState = {
    user: user,
    registerUser: handleRegister,
    loginUser: handleLogin,
    refreshTokens: handleRefreshingTokens,
    logoutUser: handleLogout,
  };

  return (
    <AuthProviderContext.Provider {...props} value={value}>
      {children}
    </AuthProviderContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthProviderContext);
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
