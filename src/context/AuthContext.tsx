import React, { createContext, useContext, useState, useEffect } from 'react'
import { api, type UserInfoDto } from '../api/api.ts'

interface AuthContextType {
  user: UserInfoDto | null
  token: string | null
  loading: boolean
  theme: 'light' | 'dark'
  login: (email: string, password: string) => Promise<void>
  register: (dto: any) => Promise<void>
  logout: () => void
  toggleTheme: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfoDto | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // Initialize Auth & Theme
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')

      // Load theme
      const storedTheme = localStorage.getItem('theme') as 'light' | 'dark'
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const activeTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light')
      setTheme(activeTheme)
      document.documentElement.setAttribute('data-theme', activeTheme)

      if (storedToken) {
        setToken(storedToken)
        try {
          // Verify with backend
          const userData = await api.auth.me()
          setUser(userData)
        } catch (err) {
          // Token expired or invalid
          console.error('Failed to verify token', err)
          api.auth.logout()
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const data = await api.auth.login({ email, password })
      setToken(data.token)
      
      // Fetch fresh profile
      const userData = await api.auth.me()
      setUser(userData)
    } catch (err) {
      logout()
      throw err;
    } finally {
      setLoading(false)
    }
  }

  const register = async (dto: any) => {
    await api.auth.register(dto)
  }

  const logout = () => {
    api.auth.logout()
    setToken(null)
    setUser(null)
  }

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        theme,
        login,
        register,
        logout,
        toggleTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
