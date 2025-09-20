-- First, create a new column for age groups as array
ALTER TABLE public.events 
ADD COLUMN age_groups text[] DEFAULT '{}';

-- Migrate existing data from age_group to age_groups
UPDATE public.events 
SET age_groups = ARRAY[age_group] 
WHERE age_group IS NOT NULL AND age_group != '';

-- Drop the old column
ALTER TABLE public.events 
DROP COLUMN age_group;

-- Rename the new column to age_group for consistency
ALTER TABLE public.events 
RENAME COLUMN age_groups TO age_group;