"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"

interface LoadingContextType {
  isLoading: boolean
  loadingText: string
  startLoading: (text?: string) => void
  stopLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider")
  }
  return context
}

interface LoadingProviderProps {
  children: ReactNode
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState("Đang tải...")

  const startLoading = (text = "Đang tải...") => {
    setLoadingText(text)
    setIsLoading(true)
  }

  const stopLoading = () => {
    setIsLoading(false)
    setLoadingText("Đang tải...")
  }

  return (
    <LoadingContext.Provider value={{ isLoading, loadingText, startLoading, stopLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">{loadingText}</span>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  )
}
