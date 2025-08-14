import api from "./api"

export interface User {
  id: number
  username: string
  email: string
  fullName: string
  avatar?: string
  bio?: string
  role: "user" | "admin"
  isActive: boolean
  createdAt: string
  updatedAt: string

}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  fullName: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

class AuthService {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private refreshPromise: Promise<string> | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("accessToken")
      this.refreshToken = localStorage.getItem("refreshToken")
      this.setupInterceptors()
    }
  }

  private setupInterceptors() {
    // Request interceptor to add access token
    api.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`
        }
        return config
      },
      (error) => Promise.reject(error),
    )

    // Response interceptor to handle token refresh
    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          if (error.response?.data?.error === "Access token expired" && this.refreshToken) {
            try {
              const newAccessToken = await this.refreshAccessToken()
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
              return api(originalRequest)
            } catch (refreshError) {
              this.logout()
              window.location.href = "/login"
              return Promise.reject(refreshError)
            }
          }
        }

        return Promise.reject(error)
      },
    )
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.performTokenRefresh()

    try {
      const newAccessToken = await this.refreshPromise
      return newAccessToken
    } finally {
      this.refreshPromise = null
    }
  }

  private async performTokenRefresh(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available")
    }

    const response = await api.post("/auth/refresh", {
      refreshToken: this.refreshToken,
    })

    const { accessToken, refreshToken: newRefreshToken } = response.data

    this.setTokens(accessToken, newRefreshToken)
    return accessToken
  }

  private setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken

    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
    }
  }

  private clearTokens() {
    this.accessToken = null
    this.refreshToken = null

    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post("/auth/login", data)
    const { accessToken, refreshToken, user } = response.data

    this.setTokens(accessToken, refreshToken)

    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user))
    }

    return response.data
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post("/auth/register", data)
    const { accessToken, refreshToken, user } = response.data

    this.setTokens(accessToken, refreshToken)

    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user))
    }

    return response.data
  }

  async logout(): Promise<void> {
    try {
      if (this.refreshToken) {
        await api.post("/auth/logout", {
          refreshToken: this.refreshToken,
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      this.clearTokens()
    }
  }

  async logoutAll(): Promise<void> {
    try {
      await api.post("/auth/logout-all")
    } catch (error) {
      console.error("Logout all error:", error)
    } finally {
      this.clearTokens()
    }
  }


  
  async getProfile() {
    const response = await api.get("/auth/profile")
    const user = response.data.user

    // Update local storage with fresh user data
    localStorage.setItem("user", JSON.stringify(user))

    return user
  }

  async updateAvatar(file: File) {
    const formData = new FormData()
    formData.append("avatar", file)

    const response = await api.put("/auth/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    const user = response.data.user
    localStorage.setItem("user", JSON.stringify(user))

    return response.data
  }

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null

    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  }

  getToken(): string | null {
    return this.accessToken
  }

  getRefreshToken(): string | null {
    return this.refreshToken
  }

  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.getCurrentUser()
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put("/auth/profile", data)
    const { user } = response.data

    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user))
    }

    return user
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await api.put("/auth/change-password", data)
    // After password change, user needs to login again
    this.clearTokens()
  }

  async forgotPassword(email: string): Promise<void> {
    await api.post("/auth/forgot-password", { email })
  }

  async resetPassword(token: string, password: string ): Promise<void> {
    await api.post("/auth/reset-password", {token, password})
  }

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData()
    formData.append("avatar", file)

    const response = await api.put("/auth/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    const { user } = response.data

    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user))
    }

    return response.data.url
  }
}

export const authService = new AuthService()
