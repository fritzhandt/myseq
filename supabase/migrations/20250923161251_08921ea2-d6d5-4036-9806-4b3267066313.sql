-- Add category column to jobs table
ALTER TABLE public.jobs ADD COLUMN category TEXT NOT NULL DEFAULT 'city';

-- Add constraint to ensure category is either 'city', 'state', or 'both'
ALTER TABLE public.jobs ADD CONSTRAINT jobs_category_check 
CHECK (category IN ('city', 'state', 'both'));