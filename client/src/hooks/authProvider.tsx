/* eslint-disable react-refresh/only-export-components */
import { useContext, createContext, useState } from "react";

interface AuthProviderProps {
  children: React.ReactNode;
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

export function AuthProvider({ children, ...props }: AuthProviderProps) {
  const [user, setUser] = useState<string | null>(null);

  const authHeaders = new Headers();
  authHeaders.append("Access-Control-Allow-Origin", "http://localhost:2442");

  const registerUser = async (data: FormData) => {
    await fetch("http://localhost:2442/auth/register", {
      method: "post",
      headers: authHeaders,
      credentials: "include",
      body: data,
    }).then(async (res) => {
      const data: unknown = await res.json();
      if (!res.ok)
        throw new Error(data?.message as string || "Failed to Register");
    }).catch((err: Error) => {
      throw new Error(err?.message || "Failed to Register");
    });
  };

  const loginUser = async (data: FormData) => {
    await fetch("http://localhost:2442/auth/login", {
      method: "post",
      headers: authHeaders,
      credentials: "include",
      body: data,
    }).then(async (res) => {
      const data: unknown = await res.json();
      if (!res.ok)
        throw new Error(data?.message as string || "Failed to Login");
      setUser("?");
      console.log(document.cookie);
    }).catch((err: Error) => {
      throw new Error(err?.message || "Failed to Login");
    });
  };

  const logoutUser = async () => {
    setUser(null);
    await fetch("http://localhost:2442/auth/logout", {
      method: "get",
      headers: authHeaders,
      credentials: "include",
    }).then(async (res) => {
      const data: unknown = await res.json();
      if (!res.ok)
        throw new Error(data?.message as string || "Logout Failed");
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
};

export const useAuth = () => {
  const context = useContext(AuthProviderContext);
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
