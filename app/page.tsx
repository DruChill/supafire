import { createClient } from "@/lib/supabase/server"
import { FileGrid } from "@/components/file-grid"
import { UploadSection } from "@/components/upload-section"
import { Header } from "@/components/header"

export default async function HomePage() {
  const isProduction = process.env.NODE_ENV === "production"

  // Only fetch files in development
  let files = []
  if (!isProduction) {
    const supabase = await createClient()
    const { data: filesData, error } = await supabase
      .from("files")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching files:", error)
    } else {
      files = filesData || []
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {!isProduction && <UploadSection />}

          <div className="space-y-6">
            {isProduction ? (
              // Production: Just show "Curioso"
              <div className="text-center py-20">
                <h1 className="text-6xl font-bold text-muted-foreground">
                  Curioso
                </h1>
              </div>
            ) : (
              // Development: Show file management interface
              <>
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-balance">
                    Gestión de Archivos
                  </h2>
                  <p className="text-muted-foreground text-pretty">
                    Sube y gestiona tus archivos para compartir
                  </p>
                </div>

                <FileGrid files={files} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
