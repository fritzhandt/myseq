-- Move Queens County Farm Museum to educational category
UPDATE resources 
SET categories = ARRAY['Educational']::text[]
WHERE organization_name = 'Queens County Farm Museum';