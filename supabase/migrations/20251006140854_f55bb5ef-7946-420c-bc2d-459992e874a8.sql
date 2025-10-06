-- Add is_active column to jobs table
ALTER TABLE public.jobs 
ADD COLUMN is_active boolean NOT NULL DEFAULT true;

-- Create index for better query performance
CREATE INDEX idx_jobs_is_active ON public.jobs(is_active);