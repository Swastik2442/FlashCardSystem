/* eslint-disable react-refresh/only-export-components */
import { useContext, createContext, useState, useEffect, Dispatch, SetStateAction } from "react";
import { registerUser, loginUser, logoutUser, refreshTokens, changeUsername, changeEmail, changePassword, deleteUser } from "@/api/auth";
import type { TLoginFormSchema, TRegisterFormSchema, TChangeUsernameFormSchema, TChangeEmailFormSchema, TChangePasswordFormSchema } from "@/types/forms";
import { USER_STORAGE_KEY } from "@/constants";

type AuthFunctionReturns = Promise<void> | void;

interface AuthProviderState {
  /** Username of the User */
  user: string | null;
  /** Date till the User is Rate Limited */
  limitedTill: Date | null;
  /** Function to set the Date till the User is Rate Limited */
  setLimitedTill: Dispatch<SetStateAction<Date | null>>;
  /** Function to Register a User */
  registerUser: (data: TRegisterFormSchema) => AuthFunctionReturns;
  /** Function to Login a User */
  loginUser: (data: TLoginFormSchema) => AuthFunctionReturns;
  /** Function to Logout the User */
  logoutUser: () => AuthFunctionReturns;
  /** Function to Change the Username */
  changeUsername: (data: TChangeUsernameFormSchema) => AuthFunctionReturns;
  /** Function to Change the Account Email */
  changeEmail: (data: TChangeEmailFormSchema) => AuthFunctionReturns;
  /** Function to Change the Account Password */
  changePassword: (data: TChangePasswordFormSchema) => AuthFunctionReturns;
  /** Function to Delete the User Account */
  deleteUser: () => AuthFunctionReturns;
}

const initialState: AuthProviderState = {
  user: null,
  limitedTill: null,
  setLimitedTill: () => console.error("setLimitedTill not implemented"),
  registerUser: () => console.error("registerUser not implemented"),
  loginUser: () => console.error("loginUser not implemented"),
  logoutUser: () => console.error("logoutUser not implemented"),
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
  const [limitedTill, setLimitedTill] = useState<Date | null>(null);

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


  const handleRefreshingTokens = async () => {
    const username = await refreshTokens();
    setUser(username);
    if (username)
      localStorage.setItem(USER_STORAGE_KEY, username);
    else
      localStorage.removeItem(USER_STORAGE_KEY);
  };
  useEffect(() => {
    if (!user)
      return;

    if (!didInit) {
      didInit = true;
      void handleRefreshingTokens();
    } else {
      const interval  = setInterval(() => {
        void handleRefreshingTokens();
      }, 1500000); // 25 minutes
      return () => clearInterval(interval);
    }
  }, [user]);

  const value: AuthProviderState = {
    user: user,
    limitedTill: limitedTill,
    setLimitedTill: setLimitedTill,
    registerUser: handleRegister,
    loginUser: handleLogin,
    logoutUser: handleLogout,
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

export const useAuth = () => {
  const context = useContext(AuthProviderContext);
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
