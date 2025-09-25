import { Shield, FileText } from "lucide-react"

export function Header() {
  const isProduction = process.env.NODE_ENV === "production"

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">SecureShare</h1>
              <p className="text-sm text-muted-foreground">{isProduction ? "Modo Compartir" : "Modo Desarrollo"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>Protegido con Supabase</span>
          </div>
        </div>
      </div>
    </header>
  )
}
