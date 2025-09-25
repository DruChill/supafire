import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import ClarityInit from '@/components/clarity-init'
import './globals.css'

export const metadata: Metadata = {
  title: 'Secure MediaFire - Comparte archivos de forma segura',
  description: 'Plataforma segura para subir y compartir archivos con enlaces protegidos',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ClarityInit />
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
