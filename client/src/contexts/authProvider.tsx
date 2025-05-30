/* eslint-disable react-refresh/only-export-components */
import {
  useContext,
  createContext,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useMemo
} from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshTokens,
  changeUsername,
  changeEmail,
  changePassword,
  deleteUser
} from "@/api/auth"
import type {
  TLoginFormSchema,
  TRegisterFormSchema,
  TChangeUsernameFormSchema,
  TChangeEmailFormSchema,
  TChangePasswordFormSchema
} from "@/types/forms"

type AuthFunctionReturns = Promise<void> | void

interface AuthProviderState {
  /** Username of the User */
  user: string | null
  /** Whether the User is Rate Limited or not */
  isUserRateLimited: boolean
  /** Date till the User is Rate Limited */
  limitedTill: Date | null
  /**
   * Function to set the Date till the User is Rate Limited.
   *
   * Will not do anything if provided date is before the one currently set.
   */
  setLimitedTill: Dispatch<SetStateAction<Date | null>>
  /** Function to Register a User */
  registerUser: (data: TRegisterFormSchema) => AuthFunctionReturns
  /** Function to Login a User */
  loginUser: (data: TLoginFormSchema) => AuthFunctionReturns
  /** Function to Logout the User */
  logoutUser: () => AuthFunctionReturns
  /** Function to Change the Username */
  changeUsername: (data: TChangeUsernameFormSchema) => AuthFunctionReturns
  /** Function to Change the Account Email */
  changeEmail: (data: TChangeEmailFormSchema) => AuthFunctionReturns
  /** Function to Change the Account Password */
  changePassword: (data: TChangePasswordFormSchema) => AuthFunctionReturns
  /** Function to Delete the User Account */
  deleteUser: () => AuthFunctionReturns
}

const initialState: AuthProviderState = {
  user: null,
  isUserRateLimited: false,
  limitedTill: null,
  setLimitedTill: () => console.error("setLimitedTill not implemented"),
  registerUser: () => console.error("registerUser not implemented"),
  loginUser: () => console.error("loginUser not implemented"),
  logoutUser: () => console.error("logoutUser not implemented"),
  changeUsername: () => console.error("changeUsername not implemented"),
  changeEmail: () => console.error("changeEmail not implemented"),
  changePassword: () => console.error("changePassword not implemented"),
  deleteUser: () => console.error("deleteUser not implemented")
}

let didInit = false

const AuthProviderContext = createContext<AuthProviderState>(initialState)

/**
 * A Context Provider to handle the Authentication of the User
 * @param children Children components to the AuthProvider
 * @param props Additional props to the AuthProvider
 */
export function AuthProvider({ children, ...props }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null)
  const [limitedTill, setLimitedTill] = useState<Date | null>(null)
  const isUserRateLimited = useMemo(
    () => (limitedTill != null && limitedTill > new Date()),
    [limitedTill]
  )
  const queryClient = useQueryClient()

  const handleLimitedTill: Dispatch<SetStateAction<Date | null>> = (value) => {
    const resolvedValue = typeof value === "function" ? value(limitedTill) : value
    if (limitedTill == null || resolvedValue == null || resolvedValue > limitedTill) {
      setLimitedTill(resolvedValue)
      if (resolvedValue)
        setTimeout(
          () => setLimitedTill(null),
          resolvedValue.getTime() - new Date().getTime()
        )
    }
  }

  const handleLogin = async (data: TLoginFormSchema) => {
    const username = await loginUser(data)
    setUser(username)
  }

  const handleLogout = async () => {
    setUser(null)
    await queryClient.invalidateQueries()
    await logoutUser()
  }

  const handleUsernameChange = async (data: TChangeUsernameFormSchema) => {
    const username = await changeUsername(data)
    setUser(username)
  }

  const handleUserDeletion = async () => {
    setUser(null)
    await queryClient.invalidateQueries()
    await deleteUser()
  }

  const handleRefreshingTokens = async () => {
    const username = await refreshTokens()
    setUser(username)
  }
  useEffect(() => {
    if (!didInit) {
      didInit = true
      void handleRefreshingTokens()
    } else if (user != null) {
      const interval  = setInterval(() => {
        void handleRefreshingTokens()
      }, 1500000) // 25 minutes
      return () => clearInterval(interval)
    }
  }, [user])

  const value: AuthProviderState = {
    user: user,
    isUserRateLimited: isUserRateLimited,
    limitedTill: limitedTill,
    setLimitedTill: handleLimitedTill,
    registerUser: async data => { await registerUser(data) },
    loginUser: handleLogin,
    logoutUser: handleLogout,
    changeUsername: handleUsernameChange,
    changeEmail: async data => { await changeEmail(data) },
    changePassword: async data => { await changePassword(data) },
    deleteUser: handleUserDeletion
  }

  return (
    <AuthProviderContext.Provider {...props} value={value}>
      {children}
    </AuthProviderContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthProviderContext)
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider")
  return context
}
