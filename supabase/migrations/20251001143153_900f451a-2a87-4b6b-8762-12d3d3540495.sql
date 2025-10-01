-- Add organization_type column to civic_organizations
ALTER TABLE public.civic_organizations 
ADD COLUMN organization_type text NOT NULL DEFAULT 'civic_organization';

-- Add a check constraint to ensure valid types
ALTER TABLE public.civic_organizations
ADD CONSTRAINT valid_organization_type 
CHECK (organization_type IN ('community_board', 'civic_organization', 'police_precinct_council'));

-- Create an index for better query performance
CREATE INDEX idx_civic_organizations_type ON public.civic_organizations(organization_type);