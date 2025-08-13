"use client"

import type React from "react"

import { useState, useRef } from "react"
import { ImageIcon, X, Check, Edit, Upload } from "lucide-react"
import Image from "next/image"
import { uploadService } from "@/services/upload"
import toast from "react-hot-toast"
import ImageCropper from "./ImageCropper"

interface FeaturedImageUploadProps {
  currentImage?: string | null
  onImageUpdate: (newImage: string | null) => void
}

export default function FeaturedImageUpload({ currentImage, onImageUpdate }: FeaturedImageUploadProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [croppedFile, setCroppedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      const result = await uploadService.uploadFeaturedImage(croppedFile)
      onImageUpdate(result.url)

      // Clear preview states
      setPreviewImage(null)
      setCroppedFile(null)
      setOriginalImage(null)

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      toast.success("Upload ảnh thành công!")
    } catch (error: any) {
      console.error("Upload error:", error)
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

  const handleRemoveImage = () => {
    onImageUpdate(null)
    handleCancel()
  }

  // Use preview image if available, otherwise use current image
  const displayImage = previewImage || (currentImage ? uploadService.getImageUrl(currentImage) : null)

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Ảnh đại diện bài viết</label>
        {displayImage && displayImage !== "/placeholder.svg" ? (
          <div className="relative">
            <Image
              src={displayImage || "/placeholder.svg"}
              alt="Featured image"
              width={600}
              height={300}
              className="w-full h-64 object-cover rounded-lg border border-gray-200"
              unoptimized={previewImage ? true : false}
            />

            {/* Action buttons overlay */}
            <div className="absolute top-3 right-3 flex space-x-2">
              {previewImage ? (
                <>
                  <button
                    type="button"
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
                    type="button"
                    onClick={handleEditCrop}
                    disabled={uploading}
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={uploading}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    title="Hủy"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <label
                    htmlFor="featured-image-edit"
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg cursor-pointer"
                    title="Thay đổi ảnh"
                  >
                    <Edit className="w-4 h-4" />
                    <input
                      ref={fileInputRef}
                      id="featured-image-edit"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    title="Xóa ảnh"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Upload progress overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p>Đang upload...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors">
            <div className="text-center">
              <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <div className="space-y-2">
                <label htmlFor="featured-image" className="cursor-pointer">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    <Upload className="w-4 h-4 mr-2" />
                    Chọn ảnh đại diện
                  </div>
                  <input
                    ref={fileInputRef}
                    id="featured-image"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </label>
                <p className="text-sm text-gray-500">PNG, JPG, GIF tối đa 5MB</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Cropper Modal */}
      {showCropper && originalImage && (
        <ImageCropper
          image={originalImage}
          isOpen={showCropper}
          onClose={() => setShowCropper(false)}
          onCropComplete={handleCropComplete}
          aspectRatio={16 / 9}
          cropShape="rect"
        />
      )}
    </>
  )
}
