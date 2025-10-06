-- Drop the existing check constraint
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_category_check;

-- Add updated check constraint to include internships
ALTER TABLE jobs ADD CONSTRAINT jobs_category_check 
CHECK (category = ANY (ARRAY['government'::text, 'private_sector'::text, 'internships'::text]));