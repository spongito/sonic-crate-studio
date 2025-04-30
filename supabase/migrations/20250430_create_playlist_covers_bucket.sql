
-- Create storage bucket for playlist covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('playlist_covers', 'playlist_covers', true);

-- Create a storage policy to allow public read access to files
CREATE POLICY "Public Access" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'playlist_covers');

-- Create a storage policy to allow authenticated users to insert objects
CREATE POLICY "Authenticated users can upload" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'playlist_covers' AND auth.role() = 'authenticated');

-- Create a storage policy to allow users to update their own objects
CREATE POLICY "Users can update own objects" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'playlist_covers' AND auth.uid() = owner);

-- Create a storage policy to allow users to delete their own objects
CREATE POLICY "Users can delete own objects" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'playlist_covers' AND auth.uid() = owner);
