-- Add type column to pending_resources table
ALTER TABLE public.pending_resources
ADD COLUMN type text NOT NULL DEFAULT 'resource';

-- Add check constraint for valid types
ALTER TABLE public.pending_resources
ADD CONSTRAINT pending_resources_type_check CHECK (type IN ('resource', 'business_opportunity'));