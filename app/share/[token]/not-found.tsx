import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileX, ArrowLeft, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
            <h1 className="text-3xl font-bold mb-2">Archivo no encontrado</h1>
            <p className="text-muted-foreground">
              El archivo que buscas no existe o ya no está disponible
            </p>
          </div>

          {/* Error Card */}
          <Card className="shadow-lg text-center">
            <CardHeader className="pb-6">
              <div className="flex justify-center mb-4">
                <FileX className="h-16 w-16 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl">
                Archivo no encontrado
              </CardTitle>
              <CardDescription className="text-lg">
                Este enlace puede haber expirado o el archivo ya no está disponible
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>Posibles causas:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• El enlace ha expirado</li>
                    <li>• El archivo fue eliminado</li>
                    <li>• El enlace es incorrecto</li>
                    <li>• El archivo no es público</li>
                  </ul>
                </div>

                <Button asChild className="w-full">
                  <Link href="/">
                    <Home className="h-4 w-4 mr-2" />
                    Ir al inicio
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}