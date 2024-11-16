/* eslint-disable react-refresh/only-export-components */
import { useContext, createContext, useState, useEffect } from "react";
import { registerUser, loginUser, logoutUser, refreshTokens, updateUser, changeUsername, changeEmail, changePassword, deleteUser } from "@/api/auth";
import type { TLoginFormSchema, TRegisterFormSchema, TUserDetailsFormSchema, TChangeUsernameFormSchema, TChangeEmailFormSchema, TChangePasswordFormSchema } from "@/types/forms";
import { USER_STORAGE_KEY } from "@/constants";

type AuthFunctionReturns = Promise<void> | void;

interface AuthProviderState {
  user: string | null;
  registerUser: (data: TRegisterFormSchema) => AuthFunctionReturns;
  loginUser: (data: TLoginFormSchema) => AuthFunctionReturns;
  refreshTokens: () => AuthFunctionReturns;
  logoutUser: () => AuthFunctionReturns;
  updateUser: (data: TUserDetailsFormSchema) => AuthFunctionReturns;
  changeUsername: (data: TChangeUsernameFormSchema) => AuthFunctionReturns;
  changeEmail: (data: TChangeEmailFormSchema) => AuthFunctionReturns;
  changePassword: (data: TChangePasswordFormSchema) => AuthFunctionReturns;
  deleteUser: () => AuthFunctionReturns;
}

const initialState: AuthProviderState = {
  user: null,
  registerUser: () => console.error("registerUser not implemented"),
  loginUser: () => console.error("loginUser not implemented"),
  refreshTokens: () => console.error("refreshTokens not implemented"),
  logoutUser: () => console.error("logoutUser not implemented"),
  updateUser: () => console.error("updateUser not implemented"),
  changeUsername: () => console.error("changeUsername not implemented"),
  changeEmail: () => console.error("changeEmail not implemented"),
  changePassword: () => console.error("changePassword not implemented"),
  deleteUser: () => console.error("deleteUser not implemented"),
};

let didInit = false;

const AuthProviderContext = createContext<AuthProviderState>(initialState);

/**
 * A Context Provider to handle the Authentication of the User
 * @param children Children components to the AuthProvider
 * @param props Additional props to the AuthProvider
 */
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

  const handleUserUpdate = async (data: TUserDetailsFormSchema) => {
    await updateUser(data);
  };

  const handleUsernameChange = async (data: TChangeUsernameFormSchema) => {
    const username = await changeUsername(data);
    setUser(username);
    localStorage.setItem(USER_STORAGE_KEY, username);
  };

  const handleEmailChange = async (data: TChangeEmailFormSchema) => {
    await changeEmail(data);
  };

  const handlePasswordChange = async (data: TChangePasswordFormSchema) => {
    await changePassword(data);
  };

  const handleUserDeletion = async () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    await deleteUser();
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
    updateUser: handleUserUpdate,
    changeUsername: handleUsernameChange,
    changeEmail: handleEmailChange,
    changePassword: handlePasswordChange,
    deleteUser: handleUserDeletion,
  };

  return (
    <AuthProviderContext.Provider {...props} value={value}>
      {children}
    </AuthProviderContext.Provider>
  );
}

/**
 * A Hook to access the AuthProvider properties
 */
export const useAuth = () => {
  const context = useContext(AuthProviderContext);
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
