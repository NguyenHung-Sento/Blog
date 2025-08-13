import api from "./api"

export interface FollowResponse {
  following: boolean
  message: string
}

export interface FollowersResponse {
  followers: Array<{
    id: number
    username: string
    fullName: string
    avatar?: string
  }>
  pagination: {
    currentPage: number
    totalPages: number
    totalFollowers: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface FollowingResponse {
  following: Array<{
    id: number
    username: string
    fullName: string
    avatar?: string
  }>
  pagination: {
    currentPage: number
    totalPages: number
    totalFollowing: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export const followService = {
  async followUser(userId: number): Promise<FollowResponse> {
    const response = await api.post(`/follow/${userId}`)
    return response.data
  },

  async unfollowUser(userId: number): Promise<FollowResponse> {
    const response = await api.delete(`/follow/${userId}`)
    return response.data
  },

  async getFollowers(userId: number, page = 1, limit = 20): Promise<FollowersResponse> {
    const response = await api.get(`/follow/${userId}/followers`, {
      params: { page, limit },
    })
    return response.data
  },

  async getFollowing(userId: number, page = 1, limit = 20): Promise<FollowingResponse> {
    const response = await api.get(`/follow/${userId}/following`, {
      params: { page, limit },
    })
    return response.data
  },

  async checkFollowStatus(userId: number): Promise<{ following: boolean }> {
    const response = await api.get(`/follow/${userId}/status`)
    return response.data
  },
}
