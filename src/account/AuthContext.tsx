import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  getSessionUser,
  loginUser,
  logoutUser,
  resendRegistrationCode,
  startRegistration,
  verifyRegistration,
} from './authStore'
import type { PublicUser, RegisterStartResult, VerifyChannel } from './types'

type AuthContextValue = {
  user: PublicUser | null
  login: (
    phone: string,
    password: string,
  ) => { ok: true } | { ok: false; error: string }
  startRegister: (input: {
    name: string
    phone: string
    email: string
    password: string
    channel: VerifyChannel
  }) => { ok: true; result: RegisterStartResult } | { ok: false; error: string }
  verifyRegister: (
    challengeId: string,
    code: string,
  ) => { ok: true } | { ok: false; error: string }
  resendRegisterCode: (
    challengeId: string,
  ) => { ok: true; result: RegisterStartResult } | { ok: false; error: string }
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

  const startRegister = useCallback(
    (input: {
      name: string
      phone: string
      email: string
      password: string
      channel: VerifyChannel
    }) => startRegistration(input),
    [],
  )

  const verifyRegister = useCallback(
    (challengeId: string, code: string) => {
      const result = verifyRegistration(challengeId, code)
      if (!result.ok) return result
      setUser(result.user)
      return { ok: true as const }
    },
    [],
  )

  const resendRegisterCode = useCallback(
    (challengeId: string) => resendRegistrationCode(challengeId),
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
      startRegister,
      verifyRegister,
      resendRegisterCode,
      logout,
      refresh,
    }),
    [
      user,
      login,
      startRegister,
      verifyRegister,
      resendRegisterCode,
      logout,
      refresh,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
