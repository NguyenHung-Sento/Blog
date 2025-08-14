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

export interface UpdateProfileData {
  fullName?: string
  bio?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export const authService = {
  async login(data: LoginData) {
    const response = await api.post("/auth/login", data)
    const { token, user } = response.data

    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))

    return { token, user }
  },

  async register(data: RegisterData) {
    const response = await api.post("/auth/register", data)
    const { token, user } = response.data

    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))

    return { token, user }
  },

  async getProfile() {
    const response = await api.get("/auth/profile")
    const user = response.data.user

    // Update local storage with fresh user data
    localStorage.setItem("user", JSON.stringify(user))

    return user
  },

  async updateProfile(data: UpdateProfileData) {
    const response = await api.put("/auth/profile", data)
    const user = response.data.user

    localStorage.setItem("user", JSON.stringify(user))

    return user
  },

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
  },

  async changePassword(data: ChangePasswordData) {
    const response = await api.put("/auth/change-password", data)
    return response.data
  },

  async forgotPassword(email: string) {
    const response = await api.post("/auth/forgot-password", { email })
    return response.data
  },

  async resetPassword(token: string, password: string) {
    const response = await api.post("/auth/reset-password", { token, password })
    return response.data
  },

  logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("authChange"))
  },

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null

    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null

    return localStorage.getItem("token")
  },

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser()
  },

  isAdmin(): boolean {
    const user = this.getCurrentUser()
    return user?.role === "admin"
  },

  // Refresh user data from server
  async refreshUser() {
    try {
      const user = await this.getProfile()
      return user
    } catch (error) {
      console.error("Failed to refresh user:", error)
      this.logout()
      return null
    }
  },
}
