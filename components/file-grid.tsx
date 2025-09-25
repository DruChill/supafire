"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, ImageIcon, Video, Music, Archive, File } from "lucide-react"

interface FileData {
  id: string
  filename: string
  original_filename: string
  file_size: number
  mime_type: string
  storage_path: string
  share_token: string
  download_count: number
  created_at: string
}

interface FileGridProps {
  files: FileData[]
}

export function FileGrid({ files }: FileGridProps) {
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set())

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="h-8 w-8 text-blue-500" />
    if (mimeType.startsWith("video/")) return <Video className="h-8 w-8 text-purple-500" />
    if (mimeType.startsWith("audio/")) return <Music className="h-8 w-8 text-green-500" />
    if (mimeType.includes("zip") || mimeType.includes("rar")) return <Archive className="h-8 w-8 text-orange-500" />
    if (mimeType.includes("text") || mimeType.includes("document"))
      return <FileText className="h-8 w-8 text-gray-500" />
    return <File className="h-8 w-8 text-gray-400" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleDownload = async (file: FileData) => {
    setDownloadingFiles((prev) => new Set(prev).add(file.id))

    try {
      const supabase = createClient()

      const { data, error } = await supabase.storage.from("files").createSignedUrl(file.storage_path, 3600) // 1 hour expiry

      if (error) throw error

      await supabase
        .from("files")
        .update({ download_count: file.download_count + 1 })
        .eq("id", file.id)

      const link = document.createElement("a")
      link.href = data.signedUrl
      link.download = file.original_filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error downloading file:", error)
      alert("Error al descargar el archivo. Inténtalo de nuevo.")
    } finally {
      setDownloadingFiles((prev) => {
        const newSet = new Set(prev)
        newSet.delete(file.id)
        return newSet
      })
    }
  }

  if (files.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay archivos disponibles</h3>
          <p className="text-muted-foreground">
            {process.env.NODE_ENV === "production"
              ? "No hay archivos compartidos en este momento."
              : "Sube tu primer archivo para comenzar."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {files.map((file) => (
        <Card key={file.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {getFileIcon(file.mime_type)}
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base truncate" title={file.original_filename}>
                    {file.original_filename}
                  </CardTitle>
                  <CardDescription className="text-sm">{formatFileSize(file.file_size)}</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Descargas:</span>
                <Badge variant="secondary">{file.download_count}</Badge>
              </div>

              <div className="text-xs text-muted-foreground">
                Subido: {new Date(file.created_at).toLocaleDateString("es-ES")}
              </div>

              <Button
                onClick={() => handleDownload(file)}
                disabled={downloadingFiles.has(file.id)}
                className="w-full"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                {downloadingFiles.has(file.id) ? "Descargando..." : "Descargar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
