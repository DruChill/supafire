import { createClient } from "@/lib/supabase/server"
import { ShareFileView } from "@/components/share-file-view"
import { notFound } from "next/navigation"

interface SharePageProps {
  params: Promise<{ token: string }>
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params
  const supabase = await createClient()

  // Fetch file by share token
  const { data: file, error } = await supabase
    .from("files")
    .select("*")
    .eq("share_token", token)
    .eq("is_public", true)
    .single()

  if (error || !file) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <ShareFileView file={file} />
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: SharePageProps) {
  const { token } = await params
  const supabase = await createClient()

  const { data: file } = await supabase
    .from("files")
    .select("original_filename, file_size")
    .eq("share_token", token)
    .eq("is_public", true)
    .single()

  if (!file) {
    return {
      title: "Archivo no encontrado - Secure MediaFire",
    }
  }

  return {
    title: `${file.original_filename} - Secure MediaFire`,
    description: `Descarga ${file.original_filename} compartido de forma segura`,
  }
}