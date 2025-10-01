-- Update jobs table to support new category structure
-- Change category column to use 'government' and 'private_sector' instead of 'city' and 'state'
ALTER TABLE public.jobs 
ALTER COLUMN category SET DEFAULT 'government';

-- Add subcategory column for government jobs (city/state/both)
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- Add comment to explain the new structure
COMMENT ON COLUMN public.jobs.category IS 'Job category: government or private_sector';
COMMENT ON COLUMN public.jobs.subcategory IS 'For government jobs: city, state, or both. Null for private_sector jobs';