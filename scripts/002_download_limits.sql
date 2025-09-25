-- Create table to track downloads by IP address
CREATE TABLE IF NOT EXISTS download_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  user_agent TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_download_attempts_file_ip ON download_attempts(file_id, ip_address);
CREATE INDEX IF NOT EXISTS idx_download_attempts_downloaded_at ON download_attempts(downloaded_at);

-- Enable RLS
ALTER TABLE download_attempts ENABLE ROW LEVEL SECURITY;

-- Policy to allow reading download attempts (for checking limits)
CREATE POLICY "Allow read download attempts" ON download_attempts
FOR SELECT USING (true);

-- Policy to allow inserting download attempts
CREATE POLICY "Allow insert download attempts" ON download_attempts
FOR INSERT WITH CHECK (true);

-- Function to clean up old download attempts (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_download_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM download_attempts 
  WHERE downloaded_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to clean up old records
-- This would need to be set up in your Supabase dashboard under Database > Cron Jobs
-- SELECT cron.schedule('cleanup-downloads', '0 2 * * *', 'SELECT cleanup_old_download_attempts();');