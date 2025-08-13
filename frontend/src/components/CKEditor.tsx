"use client"

import { useEffect, useRef, useState } from "react"

interface CKEditorProps {
  data: string
  onChange: (data: string) => void
  onReady?: (editor: any) => void
}

export default function CKEditor({ data, onChange, onReady }: CKEditorProps) {
  const editorRef = useRef<any>()
  const [isLoaded, setIsLoaded] = useState(false)
  const { CKEditor, ClassicEditor } = editorRef.current || {}

  useEffect(() => {
    const loadEditor = async () => {
      try {
        const CKEditorModule = await import("@ckeditor/ckeditor5-react")
        const ClassicEditorModule = await import("@ckeditor/ckeditor5-build-classic")

        editorRef.current = {
          CKEditor: CKEditorModule.CKEditor,
          ClassicEditor: ClassicEditorModule.default,
        }
        setIsLoaded(true)
      } catch (error) {
        console.error("Error loading CKEditor:", error)
      }
    }

    loadEditor()
  }, [])

  if (!isLoaded || !CKEditor || !ClassicEditor) {
    return (
      <div className="w-full h-64 border border-gray-300 rounded-md flex items-center justify-center">
        <div className="text-gray-500">Đang tải trình soạn thảo...</div>
      </div>
    )
  }

  return (
    <CKEditor
      editor={ClassicEditor}
      data={data}
      onReady={(editor: any) => {
        // Configure image upload
        editor.plugins.get("FileRepository").createUploadAdapter = (loader: any) => {
          return {
            upload: () => {
              return loader.file.then((file: File) => {
                return new Promise((resolve, reject) => {
                  const formData = new FormData()
                  formData.append("image", file)

                  // Get token from localStorage
                  const token = localStorage.getItem("token")
                  if (!token) {
                    reject("No authentication token found")
                    return
                  }

                  fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/image`, {
                    method: "POST",
                    body: formData,
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  })
                    .then((response) => {
                      if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`)
                      }
                      return response.json()
                    })
                    .then((result) => {
                      if (result.url) {
                        // Construct full URL for the image
                        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || ""
                        const fullUrl = result.url.startsWith("http") ? result.url : `${baseUrl}${result.url}`

                        resolve({
                          default: fullUrl,
                        })
                      } else {
                        reject(result.error || "Upload failed")
                      }
                    })
                    .catch((error) => {
                      console.error("Upload error:", error)
                      reject(error.message || "Upload failed")
                    })
                })
              })
            },
          }
        }

        if (onReady) {
          onReady(editor)
        }
      }}
      onChange={(event: any, editor: any) => {
        const data = editor.getData()
        onChange(data)
      }}
      config={{
        toolbar: [
          "heading",
          "|",
          "bold",
          "italic",
          "link",
          "bulletedList",
          "numberedList",
          "|",
          "outdent",
          "indent",
          "|",
          "imageUpload",
          "blockQuote",
          "insertTable",
          "mediaEmbed",
          "|",
          "undo",
          "redo",
        ],
        heading: {
          options: [
            { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
            { model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
            { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
            { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
          ],
        },
        image: {
          toolbar: [
            "imageTextAlternative",
            "imageStyle:inline",
            "imageStyle:block",
            "imageStyle:side",
            "|",
            "toggleImageCaption",
            "imageResize",
          ],
          resizeOptions: [
            {
              name: "imageResize:original",
              label: "Original",
              value: null,
            },
            {
              name: "imageResize:50",
              label: "50%",
              value: "50",
            },
            {
              name: "imageResize:75",
              label: "75%",
              value: "75",
            },
          ],
        },
        table: {
          contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
        },
      }}
    />
  )
}
