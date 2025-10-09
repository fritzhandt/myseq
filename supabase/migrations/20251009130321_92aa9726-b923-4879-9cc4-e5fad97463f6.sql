-- Update 'environment' category to 'environmental' in resources table
UPDATE public.resources 
SET categories = array_replace(categories, 'environment', 'environmental')
WHERE 'environment' = ANY(categories);

-- Update 'environment' category to 'environmental' in pending_resources table
UPDATE public.pending_resources 
SET categories = array_replace(categories, 'environment', 'environmental')
WHERE 'environment' = ANY(categories);