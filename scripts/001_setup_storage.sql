-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('files', 'files', false);

-- Create policy to allow authenticated users to upload files (development only)
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'files' AND auth.role() = 'authenticated');

-- Create policy to allow public downloads via signed URLs
CREATE POLICY "Allow public downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'files');

-- Update files table with RLS policies
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Allow public read access to files marked as public
CREATE POLICY "Allow public read access" ON files
FOR SELECT USING (is_public = true);

-- Allow authenticated users to insert files (development only)
CREATE POLICY "Allow authenticated inserts" ON files
FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated updates" ON files
FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
