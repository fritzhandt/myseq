-- Remove Recreational category from Southeast Queens Residential Environmental Justice Coalition
UPDATE resources 
SET 
  categories = ARRAY['legal services']::text[],
  updated_at = now()
WHERE organization_name = 'Southeast Queens Residential Environmental Justice Coalition';