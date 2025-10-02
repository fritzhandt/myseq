-- Drop the existing check constraint
ALTER TABLE public.civic_organizations 
DROP CONSTRAINT IF EXISTS valid_organization_type;

-- Add the updated check constraint with all three organization types
ALTER TABLE public.civic_organizations
ADD CONSTRAINT valid_organization_type 
CHECK (organization_type IN ('civic_organization', 'community_board', 'police_council'));