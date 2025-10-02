-- Add generic meeting times for remaining civic organizations

UPDATE public.civic_organizations 
SET meeting_info = 'Meets regularly - Contact organization for current meeting schedule'
WHERE organization_type = 'civic_organization' 
AND meeting_info IS NULL;