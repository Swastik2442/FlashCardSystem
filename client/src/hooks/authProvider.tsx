/* eslint-disable react-refresh/only-export-components */
import { useContext, createContext, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const authHeaders = new Headers();
authHeaders.append("Access-Control-Allow-Origin", "http://localhost:2442");

export function fetchWithAuth(url: string | URL | globalThis.Request, method: string, body?: BodyInit | null) {
  return fetch(url, {
    method: method,
    headers: authHeaders,
    credentials: "include",
    body: body,
  });
}

interface AuthResponse {
  status: string;
  message: string;
  data?: string | null;
}

interface AuthProviderProps {
  children: React.ReactNode;
  storageKey?: string;
}

interface AuthProviderState {
  user: string | null;
  registerUser: (data: FormData) => void | Promise<void>;
  loginUser: (data: FormData) => void | Promise<void>;
  logoutUser: () => void | Promise<void>;
}

const initialState: AuthProviderState = {
  user: null,
  registerUser: () => console.error("registerUser not implemented"),
  loginUser: () => console.error("loginUser not implemented"),
  logoutUser: () => console.error("logoutUser not implemented"),
};

const AuthProviderContext = createContext<AuthProviderState>(initialState);

export function AuthProvider({ children, storageKey = "fcs-user", ...props }: AuthProviderProps) {
  const [user, setUser] = useState<string | null>(localStorage.getItem(storageKey));

  const registerUser = async (data: FormData) => {
    await fetchWithAuth(
      "http://localhost:2442/auth/register",
      "post",
      data
    ).then(async (res) => {
      const data = await res.json() as AuthResponse;
      if (!res?.ok)
        throw new Error(data?.message || "Failed to Register");
    }).catch((err: Error) => {
      throw new Error(err?.message || "Failed to Register");
    });
  };

  const loginUser = async (data: FormData) => {
    await fetchWithAuth(
      "http://localhost:2442/auth/login",
      "post",
      data
    ).then(async (res) => {
      const data = await res.json() as AuthResponse;
      if (!res?.ok)
        throw new Error(data?.message || "Failed to Login");

      const username = data.data!;
      setUser(username);
      localStorage.setItem(storageKey, username);
    }).catch((err: Error) => {
      throw new Error(err?.message || "Failed to Login");
    });
  };

  const logoutUser = async () => {
    await fetchWithAuth(
      "http://localhost:2442/auth/logout",
      "get"
    ).then(async (res) => {
      const data = await res.json() as AuthResponse;
      if (!res?.ok)
        throw new Error(data?.message || "Logout Failed");

      setUser(null);
      localStorage.removeItem(storageKey);
    }).catch((err: Error) => {
      throw new Error(err?.message || "Logout Failed");
    });
  };

  const value: AuthProviderState = {
    user: user,
    registerUser: registerUser,
    loginUser: loginUser,
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

export const PrivateRoutes = () => {
  const { user } = useAuth();
  return (user != null ? <Outlet /> : <Navigate to="/auth/login" />);
}
