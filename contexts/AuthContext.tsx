"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user || data.data?.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        throw new Error("Server response was not valid JSON. Please try again.")
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || "Sign in failed")
      }

      if (data.success && data.user) {
        setUser(data.user)
      } else {
        throw new Error("Sign in failed - invalid response")
      }
    } catch (error) {
      console.error("SignIn error:", error)
      throw error
    }
  }

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        throw new Error("Server response was not valid JSON. Please try again.")
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || "Account creation failed")
      }

      if (data.success && data.user) {
        setUser(data.user)
      } else {
        throw new Error("Account creation failed - invalid response")
      }
    } catch (error) {
      console.error("SignUp error:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" })
    } catch (error) {
      console.error("SignOut error:", error)
    } finally {
      setUser(null)
    }
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
