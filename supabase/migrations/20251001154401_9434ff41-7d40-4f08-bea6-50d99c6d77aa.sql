-- Update existing resources with "mental health" category to "mental health/wellness"
UPDATE public.resources
SET categories = array_replace(categories, 'mental health', 'mental health/wellness')
WHERE 'mental health' = ANY(categories);

-- Also handle variations like "Mental Health", "mental-health", etc.
UPDATE public.resources
SET categories = array_replace(categories, 'Mental Health', 'mental health/wellness')
WHERE 'Mental Health' = ANY(categories);

UPDATE public.resources
SET categories = array_replace(categories, 'mental-health', 'mental health/wellness')
WHERE 'mental-health' = ANY(categories);