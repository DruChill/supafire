"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function UploadSection() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const router = useRouter()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const supabase = createClient()

      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const shareToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)

      const { data: uploadData, error: uploadError } = await supabase.storage.from("files").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) throw uploadError

      setUploadProgress(50)

      // Get current user (might be null for anonymous users)
      const { data: { user } } = await supabase.auth.getUser()

      const { error: dbError } = await supabase.from("files").insert({
        filename: fileName,
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_path: uploadData.path,
        share_token: shareToken,
        is_public: true,
        download_count: 0,
        user_id: user?.id || null, // Allow null for anonymous users
      })

      if (dbError) throw dbError

      setUploadProgress(100)

      event.target.value = ""
      router.refresh()
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Error al subir el archivo. Inténtalo de nuevo.")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Subir Archivo
        </CardTitle>
        <CardDescription>Sube archivos para compartir de forma segura. Solo disponible en desarrollo.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file">Seleccionar archivo</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="cursor-pointer"
            />
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Subiendo archivo... {uploadProgress}%
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
