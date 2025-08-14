"use client"

import Link from "next/link"
import type React from "react"
import { useNavigationLoading } from "@/hooks/useNavigationLoading"

interface LoadingLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  loadingText?: string
  onClick?: () => void
}

const LoadingLink: React.FC<LoadingLinkProps> = ({
  href,
  children,
  className = "",
  loadingText = "Đang tải...",
  onClick,
}) => {
  const { startNavigation } = useNavigationLoading()

  const handleClick = () => {
    startNavigation(loadingText)
    onClick?.()
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}

export default LoadingLink
