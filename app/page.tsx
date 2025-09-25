import { createClient } from "@/lib/supabase/server"
import { FileGrid } from "@/components/file-grid"
import { UploadSection } from "@/components/upload-section"
import { Header } from "@/components/header"

export default async function HomePage() {
  const supabase = await createClient()

  const { data: files, error } = await supabase
    .from("files")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching files:", error)
  }

  const isProduction = process.env.NODE_ENV === "production"

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {!isProduction && <UploadSection />}

          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-balance">
                {isProduction ? "Archivos Compartidos" : "Gestión de Archivos"}
              </h2>
              <p className="text-muted-foreground text-pretty">
                {isProduction
                  ? "Descarga los archivos disponibles de forma segura"
                  : "Sube y gestiona tus archivos para compartir"}
              </p>
            </div>

            <FileGrid files={files || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
