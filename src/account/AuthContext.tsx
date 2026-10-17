import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  completeEmailPasswordReset,
  findAccountHint,
  getSessionUser,
  loginUser,
  logoutUser,
  registerUser,
  resetPasswordWithRecovery,
  startEmailPasswordReset,
} from './authStore'
import type { PasswordResetChallenge, PublicUser } from './types'

type AuthContextValue = {
  user: PublicUser | null
  login: (
    phone: string,
    password: string,
  ) => { ok: true } | { ok: false; error: string }
  register: (input: {
    name: string
    phone: string
    email: string
    password: string
  }) =>
    | { ok: true; recoveryCode: string }
    | { ok: false; error: string }
  lookupAccount: typeof findAccountHint
  startEmailReset: typeof startEmailPasswordReset
  completeEmailReset: typeof completeEmailPasswordReset
  resetWithRecovery: typeof resetPasswordWithRecovery
  logout: () => void
  refresh: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(() => getSessionUser())

  const refresh = useCallback(() => {
    setUser(getSessionUser())
  }, [])

  const login = useCallback((phone: string, password: string) => {
    const result = loginUser({ phone, password })
    if (!result.ok) return result
    setUser(result.user)
    return { ok: true as const }
  }, [])

  const register = useCallback(
    (input: {
      name: string
      phone: string
      email: string
      password: string
    }) => {
      const result = registerUser(input)
      if (!result.ok) return result
      setUser(result.user)
      return { ok: true as const, recoveryCode: result.recoveryCode }
    },
    [],
  )

  const logout = useCallback(() => {
    logoutUser()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      lookupAccount: findAccountHint,
      startEmailReset: startEmailPasswordReset,
      completeEmailReset: completeEmailPasswordReset,
      resetWithRecovery: resetPasswordWithRecovery,
      logout,
      refresh,
    }),
    [user, login, register, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export type { PasswordResetChallenge }
