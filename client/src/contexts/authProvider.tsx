/* eslint-disable react-refresh/only-export-components */
import { useContext, createContext, useState, useEffect, useCallback } from "react";
import fetchWithCredentials from "@/utils/fetch";
import type { TLoginFormSchema, TRegisterFormSchema } from "@/types/forms";

type AuthResponse = ICustomResponse<string | null>;

interface AuthProviderProps {
  children: React.ReactNode;
  storageKey?: string;
}

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

export function AuthProvider({ children, storageKey = "fcs-user", ...props }: AuthProviderProps) {
  const [user, setUser] = useState<string | null>(localStorage.getItem(storageKey));

  const registerUser = async (data: TRegisterFormSchema) => {
    await fetchWithCredentials(
      `${import.meta.env.VITE_SERVER_HOST}/auth/register`,
      "post",
      JSON.stringify(data)
    ).then(async (res) => {
      const data = await res.json() as AuthResponse;
      if (!res?.ok)
        throw new Error(data?.message || "Failed to Register");
    }).catch((err: Error) => {
      throw new Error(err?.message || "Failed to Register");
    });
  };

  const loginUser = async (data: TLoginFormSchema) => {
    await fetchWithCredentials(
      `${import.meta.env.VITE_SERVER_HOST}/auth/login`,
      "post",
      JSON.stringify(data)
    ).then(async (res) => {
      const data = await res.json() as AuthResponse;
      if (!res?.ok)
        throw new Error(data?.message || "Failed to Login");

      // BUG: if already logged in and new login fails, cookies are still valid but user becomes null
      const username = data.data!;
      setUser(username);
      localStorage.setItem(storageKey, username);
    }).catch((err: Error) => {
      throw new Error(err?.message || "Failed to Login");
    });
  };

  const logoutUser = async () => {
    setUser(null);
    localStorage.removeItem(storageKey);

    await fetchWithCredentials(
      `${import.meta.env.VITE_SERVER_HOST}/auth/logout`, "get"
    ).then(async (res) => {
      const data = await res.json() as AuthResponse;
      if (!res?.ok)
        throw new Error(data?.message || "Logout Failed");
    }).catch((err: Error) => {
      throw new Error(err?.message || "Logout Failed");
    });
  };

  const refreshTokens = async () => {
    await fetchWithCredentials(
      `${import.meta.env.VITE_SERVER_HOST}/auth/refresh-token`, "get"
    ).then(async (res) => {
      const data = await res.json() as AuthResponse;
      if (!res?.ok)
        throw new Error(data?.message || "Failed to Refresh Tokens");

      const username = data.data!;
      setUser(username);
      localStorage.setItem(storageKey, username);
    }).catch((err: Error) => {
      throw new Error(err?.message || "Failed to Register");
    });
  };

  const callbackRefreshTokens = useCallback(refreshTokens, [storageKey]);
  useEffect(() => {
    if (!didInit) {
      didInit = true;
      void callbackRefreshTokens();
    }
  }, [callbackRefreshTokens]);

  const value: AuthProviderState = {
    user: user,
    registerUser: registerUser,
    loginUser: loginUser,
    refreshTokens: refreshTokens,
    logoutUser: logoutUser,
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
