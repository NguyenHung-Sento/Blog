"use client"

import { useState, useEffect } from "react"
import { authService, type User } from "@/services/auth"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = authService.getCurrentUser()
      const token = authService.getToken()

      setUser(currentUser)
      setIsAuthenticated(!!token && !!currentUser)
      setIsLoading(false)
    }

    checkAuth()

    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const login = async (email: string, password: string) => {
    const result = await authService.login({ email, password })
    setUser(result.user)
    setIsAuthenticated(true)
    return result
  }

  const register = async (data: {
    username: string
    email: string
    password: string
    fullName: string
  }) => {
    const result = await authService.register(data)
    setUser(result.user)
    setIsAuthenticated(true)
    return result
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  const logoutAll = async () => {
    await authService.logoutAll()
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateProfile = async (data: Partial<User>) => {
    const updatedUser = await authService.updateProfile(data)
    setUser(updatedUser)
    return updatedUser
  }

  const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
    await authService.changePassword(data)
    setUser(null)
    setIsAuthenticated(false)
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    logoutAll,
    updateProfile,
    changePassword,
  }
}
