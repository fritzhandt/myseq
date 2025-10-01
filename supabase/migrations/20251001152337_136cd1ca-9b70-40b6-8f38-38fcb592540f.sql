-- Add type column to resources table to distinguish between regular resources and business opportunities
ALTER TABLE public.resources
ADD COLUMN type text NOT NULL DEFAULT 'resource';

-- Add check constraint for valid types
ALTER TABLE public.resources
ADD CONSTRAINT resources_type_check CHECK (type IN ('resource', 'business_opportunity'));

-- Update existing business category resources to be business opportunities
UPDATE public.resources
SET type = 'business_opportunity'
WHERE 'business' = ANY(categories);

-- Remove 'business' from categories array for migrated resources
UPDATE public.resources
SET categories = array_remove(categories, 'business')
WHERE type = 'business_opportunity';