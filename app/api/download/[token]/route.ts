import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkDownloadLimit, recordDownloadAttempt } from '@/lib/download-limits'

function getClientIP(request: NextRequest): string {
  // Try to get real IP from various headers (for when behind proxy/CDN)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
  
  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  
  // Fallback to connection IP (might be localhost in development)
  return request.ip || '127.0.0.1'
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const supabase = await createClient()

    // Get file by share token
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('share_token', token)
      .eq('is_public', true)
      .single()

    if (fileError || !file) {
      return NextResponse.json(
        { error: 'Archivo no encontrado o no disponible' },
        { status: 404 }
      )
    }

    // Get client IP and user agent
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // Check download limits
    const limitCheck = await checkDownloadLimit(file.id, clientIP)

    if (!limitCheck.canDownload) {
      await recordDownloadAttempt(file.id, clientIP, userAgent, false)
      return NextResponse.json(
        { 
          error: limitCheck.message,
          remainingAttempts: limitCheck.remainingAttempts
        },
        { status: 429 } // Too Many Requests
      )
    }

    // Create signed URL for download (no expiry or long expiry for permanent links)
    const { data: signedData, error: signedError } = await supabase.storage
      .from('files')
      .createSignedUrl(file.storage_path, 365 * 24 * 60 * 60) // 1 year expiry (effectively permanent)

    if (signedError || !signedData) {
      await recordDownloadAttempt(file.id, clientIP, userAgent, false)
      return NextResponse.json(
        { error: 'Error generando enlace de descarga' },
        { status: 500 }
      )
    }

    // Record successful download attempt
    await recordDownloadAttempt(file.id, clientIP, userAgent, true)

    // Update download count
    await supabase
      .from('files')
      .update({ download_count: file.download_count + 1 })
      .eq('id', file.id)

    // Return the download URL with file info
    return NextResponse.json({
      downloadUrl: signedData.signedUrl,
      filename: file.original_filename,
      remainingAttempts: limitCheck.remainingAttempts - 1,
      message: `Descarga iniciada. Te quedan ${limitCheck.remainingAttempts - 1} descargas para este archivo.`
    })

  } catch (error) {
    console.error('Download API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}