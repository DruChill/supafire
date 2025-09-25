import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkDownloadLimit } from '@/lib/download-limits'

function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  
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
      .select('id')
      .eq('share_token', token)
      .eq('is_public', true)
      .single()

    if (fileError || !file) {
      return NextResponse.json(
        { error: 'Archivo no encontrado' },
        { status: 404 }
      )
    }

    // Get client IP
    const clientIP = getClientIP(request)

    // Check download limits
    const limitCheck = await checkDownloadLimit(file.id, clientIP)

    return NextResponse.json({
      canDownload: limitCheck.canDownload,
      remainingAttempts: limitCheck.remainingAttempts,
      message: limitCheck.message
    })

  } catch (error) {
    console.error('Check limits API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}