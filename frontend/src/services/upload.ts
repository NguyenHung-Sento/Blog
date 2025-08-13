import api from "./api"

export const uploadService = {
  async uploadImage(file: File) {
    const formData = new FormData()
    formData.append("image", file)

    const response = await api.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  },

  async uploadFeaturedImage(file: File) {
    const formData = new FormData()
    formData.append("featuredImage", file)

    const response = await api.post("/upload/featured-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  },

  async uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append("avatar", file)

    const response = await api.put("/auth/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  },

  async deleteImage(filename: string) {
    await api.delete(`/upload/${filename}`)
  },

  // Helper function to get full image URL
  getImageUrl(path: string): string {
    if (!path) return "/placeholder.svg"
    if (path.startsWith("http")) return path
    return `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${path}`
  },
}
