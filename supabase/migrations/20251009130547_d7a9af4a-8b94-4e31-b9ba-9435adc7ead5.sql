-- Update 'Environment' (capitalized) category to 'Environmental' in resources table
UPDATE public.resources 
SET categories = array_replace(categories, 'Environment', 'Environmental')
WHERE 'Environment' = ANY(categories);

-- Update 'Environment' (capitalized) category to 'Environmental' in pending_resources table
UPDATE public.pending_resources 
SET categories = array_replace(categories, 'Environment', 'Environmental')
WHERE 'Environment' = ANY(categories);