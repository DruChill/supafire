"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, ImageIcon, Video, Music, Archive, File, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

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

interface ShareFileViewProps {
  file: FileData
}

export function ShareFileView({ file }: ShareFileViewProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="h-16 w-16 text-blue-500" />
    if (mimeType.startsWith("video/")) return <Video className="h-16 w-16 text-purple-500" />
    if (mimeType.startsWith("audio/")) return <Music className="h-16 w-16 text-green-500" />
    if (mimeType.includes("zip") || mimeType.includes("rar")) return <Archive className="h-16 w-16 text-orange-500" />
    if (mimeType.includes("text") || mimeType.includes("document"))
      return <FileText className="h-16 w-16 text-gray-500" />
    return <File className="h-16 w-16 text-gray-400" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleDownload = async () => {
    setIsDownloading(true)

    try {
      // Use our new API endpoint that handles IP limits
      const response = await fetch(`/api/download/${file.share_token}`)
      const result = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          // Too many downloads
          alert(result.error || "Has alcanzado el límite de descargas para este archivo.")
          return
        }
        throw new Error(result.error || "Error al procesar la descarga")
      }

      // Show remaining attempts message if available
      if (result.message) {
        console.log(result.message)
      }

      // Trigger download using the signed URL from our API
      const link = document.createElement("a")
      link.href = result.downloadUrl
      link.download = result.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

    } catch (error) {
      console.error("Error downloading file:", error)
      alert("Error al descargar el archivo. Inténtalo de nuevo.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Archivo Compartido</h1>
        <p className="text-muted-foreground">
          Descarga este archivo compartido de forma segura
        </p>
      </div>

      {/* File Card */}
      <Card className="shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            {getFileIcon(file.mime_type)}
          </div>
          <CardTitle className="text-xl" title={file.original_filename}>
            {file.original_filename}
          </CardTitle>
          <CardDescription className="text-lg">
            {formatFileSize(file.file_size)}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* File Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Tipo de archivo:</span>
                <div className="font-medium">{file.mime_type}</div>
              </div>
              {/* <div>
                <span className="text-muted-foreground">Descargas:</span>
                <div>
                  <Badge variant="secondary" className="ml-1">
                    {file.download_count}
                  </Badge>
                </div>
              </div> */}
              <div className="col-span-2">
                {/* <span className="text-muted-foreground">Subido:</span> */}
                <span className="text-muted-foreground">Actualizado:</span>
                <div className="font-medium">
                  {new Date(file.created_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </div>
              </div>
            </div>

            {/* Download Button */}
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Descargando...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Descargar
                </>
              )}
            </Button>

            {/* Security Notice */}
            <div className="text-xs text-muted-foreground text-center p-4 bg-secondary/50 rounded-lg">
              <p>Si hay algún problema con la descarga, por favor contacta al soporte.</p>
              <p> 
                <a href="https://www.drudev.me/contacto" className="text-blue-500 hover:underline">Te responderemos lo antes posible.</a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}