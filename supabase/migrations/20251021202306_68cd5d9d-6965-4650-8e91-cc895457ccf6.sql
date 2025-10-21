-- Allow public (anonymous) users to submit resources to pending_resources
DROP POLICY IF EXISTS "Admins can create pending resources" ON pending_resources;

CREATE POLICY "Anyone can create pending resources" 
ON pending_resources 
FOR INSERT 
WITH CHECK (true);

-- Allow public users to upload images to the event-images bucket
-- First, let's create policies for the event-images bucket in storage.objects
CREATE POLICY "Public can upload to event-images bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'event-images');

CREATE POLICY "Public can read event-images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'event-images');