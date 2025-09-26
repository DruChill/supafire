"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, ImageIcon, Video, Music, Archive, File, Loader2 } from "lucide-react"

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
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null)

  // Check remaining download attempts when component loads
  useEffect(() => {
    const checkRemainingAttempts = async () => {
      try {
        const response = await fetch(`/api/check-limits/${file.share_token}`)
        const result = await response.json()
        
        if (response.ok) {
          setRemainingAttempts(result.remainingAttempts)
        }
      } catch (error) {
        console.error("Error checking remaining attempts:", error)
        // Default to 3 if we can't check
        setRemainingAttempts(3)
      }
    }

    checkRemainingAttempts()
  }, [file.share_token])

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

      // Update remaining attempts after successful download
      if (typeof result.remainingAttempts === 'number') {
        setRemainingAttempts(result.remainingAttempts)
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
              <div>
                <span className="text-muted-foreground">Descargas restantes:</span>
                <div>
                  {remainingAttempts !== null ? (
                    <Badge 
                      variant={remainingAttempts > 1 ? "secondary" : remainingAttempts === 1 ? "destructive" : "outline"} 
                    >
                      {remainingAttempts === 0 ? "Agotadas" : `${remainingAttempts} restante${remainingAttempts !== 1 ? 's' : ''}`}
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      Verificando...
                    </Badge>
                  )}
                </div>
              </div>
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
              disabled={isDownloading || remainingAttempts === 0}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Descargando...
                </>
              ) : remainingAttempts === 0 ? (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Sin descargas disponibles
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
              <p>Imagina cuanto ahorras al usar esto ¡Muchooooo!</p>
              {remainingAttempts === 0 && (
                <p className="text-destructive font-medium mt-2">
                  ⏰ Has agotado tus descargas. Intenta mañana.
                </p>
              )}
              <p className="mt-2"> 
                <a href="https://www.drudev.me/contacto" className="text-blue-500 hover:underline">
                  ¿Problemas? Contáctanos aquí.
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}