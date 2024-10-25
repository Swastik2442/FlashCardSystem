/* eslint-disable react-refresh/only-export-components */
import { useContext, createContext } from "react";

interface AuthProviderProps {
  children: React.ReactNode;
}

interface AuthProviderState {
  abc?: string;
}

const initialState: AuthProviderState = {
  abc: "system",
};

const AuthProviderContext = createContext<AuthProviderState>(initialState);

export function AuthProvider({ children, ...props }: AuthProviderProps) {
  const value: AuthProviderState = {};

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
