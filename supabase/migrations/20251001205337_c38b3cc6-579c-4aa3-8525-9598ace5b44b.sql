-- Drop the existing foreign key constraint
ALTER TABLE analytics_events 
DROP CONSTRAINT IF EXISTS analytics_events_civic_org_id_fkey;

-- Recreate the foreign key with ON DELETE SET NULL
-- This preserves analytics data when a civic org is deleted
ALTER TABLE analytics_events
ADD CONSTRAINT analytics_events_civic_org_id_fkey
FOREIGN KEY (civic_org_id)
REFERENCES civic_organizations(id)
ON DELETE SET NULL;