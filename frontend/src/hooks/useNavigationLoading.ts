"use client"

import { useLoading } from "@/contexts/LoadingContext"
import { useRouter } from "next/navigation"

export const useNavigationLoading = () => {
  const { startLoading, stopLoading } = useLoading()
  const router = useRouter()

  const startNavigation = (text?: string) => {
    startLoading(text)
    setTimeout(() => {
      stopLoading()
    }, 2000)
  }

  const navigateWithLoading = (href: string, text?: string) => {
    startNavigation(text)
    router.push(href)
  }

  return { startNavigation, navigateWithLoading, stopLoading }
}
