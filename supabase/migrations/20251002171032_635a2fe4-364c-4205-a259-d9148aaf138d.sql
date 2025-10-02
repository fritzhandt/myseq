-- Update all restaurants to Food category
UPDATE public.resources 
SET categories = ARRAY['Food']::text[]
WHERE organization_name ILIKE '%restaurant%' 
   OR organization_name ILIKE '%seafood%'
   OR organization_name IN ('32 North', 'Caribbean Soul', 'Cookerz Blend', 'Cara Mia', 'Southern Girl Soul Food', 'Netties Restaurant')
   OR description ILIKE '%restaurant%';