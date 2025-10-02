-- Update legal services to proper case
UPDATE public.resources 
SET categories = ARRAY['Legal Services']::text[]
WHERE categories = ARRAY['legal services']::text[];