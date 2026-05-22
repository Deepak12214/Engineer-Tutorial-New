'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  name: string
  email: string
  role: 'free_user' | 'premium_user' | 'admin' | 'author'
  subscriptionStatus: 'free' | 'pro'
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoaded: boolean
  login: (email: string, password: string, name?: string) => void
  logout: () => void
  isAdmin: boolean
  isPremium: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoaded: false,
  login: () => {},
  logout: () => {},
  isAdmin: false,
  isPremium: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('et_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { localStorage.removeItem('et_user') }
    }
    setIsLoaded(true)
  }, [])

  function login(email: string, _password: string, name?: string) {
    const isAdmin = email.toLowerCase().includes('admin')
    const isPro = email.toLowerCase().includes('pro') || email.toLowerCase().includes('admin')
    const newUser: User = {
      name: name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email,
      role: isAdmin ? 'admin' : isPro ? 'premium_user' : 'free_user',
      subscriptionStatus: isPro ? 'pro' : 'free',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    }
    localStorage.setItem('et_user', JSON.stringify(newUser))
    setUser(newUser)
    if (isAdmin) router.push('/admin')
    else router.push('/dashboard')
  }

  function logout() {
    localStorage.removeItem('et_user')
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoaded,
      login,
      logout,
      isAdmin: user?.role === 'admin' || user?.role === 'author',
      isPremium: user?.subscriptionStatus === 'pro',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
