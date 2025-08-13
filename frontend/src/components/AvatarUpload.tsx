"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Camera, X, Check, Edit } from "lucide-react"
import Image from "next/image"
import { uploadService } from "@/services/upload"
import toast from "react-hot-toast"
import ImageCropper from "./ImageCropper"

interface AvatarUploadProps {
  currentAvatar?: string
  onAvatarUpdate: (newAvatar: string) => void
  size?: "sm" | "md" | "lg"
}

export default function AvatarUpload({ currentAvatar, onAvatarUpdate, size = "lg" }: AvatarUploadProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [croppedFile, setCroppedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }

  const buttonSizeClasses = {
    sm: "p-1",
    md: "p-2",
    lg: "p-3",
  }

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ được upload file ảnh")
      return
    }

    // Create preview URL for cropper
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      setOriginalImage(imageUrl)
      setShowCropper(true)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = (croppedImage: File) => {
    setCroppedFile(croppedImage)

    // Create preview URL for cropped image
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string)
    }
    reader.readAsDataURL(croppedImage)

    setShowCropper(false)
  }

  const handleUpload = async () => {
    if (!croppedFile) return

    setUploading(true)
    try {
      const result = await uploadService.uploadAvatar(croppedFile)

      // Update avatar with full URL
      const fullAvatarUrl = uploadService.getImageUrl(result.user.avatar)
      onAvatarUpdate(result.user.avatar)

      // Clear preview states
      setPreviewImage(null)
      setCroppedFile(null)
      setOriginalImage(null)

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      toast.success("Cập nhật ảnh đại diện thành công!")
    } catch (error: any) {
      console.error("Upload avatar error:", error)
      const message = error.response?.data?.error || "Có lỗi xảy ra khi upload ảnh"
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setPreviewImage(null)
    setCroppedFile(null)
    setOriginalImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleEditCrop = () => {
    if (originalImage) {
      setShowCropper(true)
    }
  }

  // Use preview image if available, otherwise use current avatar
  const displayImage = previewImage || (currentAvatar ? uploadService.getImageUrl(currentAvatar) : null)

  return (
    <>
      <div className="relative">
        <div
          className={`${sizeClasses[size]} relative rounded-full overflow-hidden border-4 border-white bg-gray-100 shadow-lg`}
        >
          {displayImage && displayImage !== "/placeholder.svg" ? (
            <Image
              src={displayImage || "/placeholder.svg"}
              alt="Avatar"
              fill
              className="object-cover"
              unoptimized={previewImage ? true : false}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Camera className={`${iconSizeClasses[size]} text-gray-400`} />
            </div>
          )}

          {/* Upload overlay when previewing */}
          {previewImage && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="flex space-x-2">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-lg"
                  title="Xác nhận"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={handleEditCrop}
                  disabled={uploading}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                  title="Chỉnh sửa"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancel}
                  disabled={uploading}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  title="Hủy"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Upload button */}
        {!previewImage && (
          <label
            htmlFor="avatar-upload"
            className={`absolute bottom-0 right-0 ${buttonSizeClasses[size]} bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg`}
          >
            <Camera className={iconSizeClasses[size]} />
            <input
              ref={fileInputRef}
              id="avatar-upload"
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleFileSelect}
            />
          </label>
        )}
      </div>

      {/* Image Cropper Modal */}
      {showCropper && originalImage && (
        <ImageCropper
          image={originalImage}
          isOpen={showCropper}
          onClose={() => setShowCropper(false)}
          onCropComplete={handleCropComplete}
          aspectRatio={1}
          cropShape="round"
        />
      )}
    </>
  )
}
