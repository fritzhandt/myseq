-- Drop the old check constraint
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_category_check;

-- Add the updated check constraint with current category values
ALTER TABLE public.jobs ADD CONSTRAINT jobs_category_check 
CHECK (category IN ('government', 'private_sector'));