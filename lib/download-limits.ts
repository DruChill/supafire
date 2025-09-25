import { createClient } from "@/lib/supabase/server"

interface DownloadLimitCheck {
  canDownload: boolean
  remainingAttempts: number
  message?: string
}

export async function checkDownloadLimit(fileId: string, ipAddress: string): Promise<DownloadLimitCheck> {
  const supabase = await createClient()
  const maxAttempts = 3 // Maximum downloads per IP per file per 24 hours

  try {
    // Count downloads from this IP for this file in the last 24 hours
    const { data: attempts, error } = await supabase
      .from('download_attempts')
      .select('id')
      .eq('file_id', fileId)
      .eq('ip_address', ipAddress)
      .gte('downloaded_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .eq('success', true)

    if (error) {
      console.error('Error checking download attempts:', error)
      return {
        canDownload: true, // Allow download on error to avoid blocking users
        remainingAttempts: maxAttempts,
        message: 'Error verificando límites de descarga, procediendo...'
      }
    }

    const downloadCount = attempts?.length || 0
    const remainingAttempts = Math.max(0, maxAttempts - downloadCount)

    if (downloadCount >= maxAttempts) {
      return {
        canDownload: false,
        remainingAttempts: 0,
        message: `Has alcanzado el límite de ${maxAttempts} descargas por día para este archivo. Inténtalo mañana.`
      }
    }

    return {
      canDownload: true,
      remainingAttempts,
    }
  } catch (error) {
    console.error('Unexpected error checking download limits:', error)
    return {
      canDownload: true,
      remainingAttempts: maxAttempts,
    }
  }
}

export async function recordDownloadAttempt(
  fileId: string, 
  ipAddress: string, 
  userAgent?: string,
  success: boolean = true
): Promise<void> {
  const supabase = await createClient()

  try {
    await supabase
      .from('download_attempts')
      .insert({
        file_id: fileId,
        ip_address: ipAddress,
        user_agent: userAgent,
        success
      })
  } catch (error) {
    console.error('Error recording download attempt:', error)
    // Don't throw error to avoid blocking downloads
  }
}