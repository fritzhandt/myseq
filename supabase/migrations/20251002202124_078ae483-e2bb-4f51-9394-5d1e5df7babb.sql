-- Add meeting times for civic organizations based on available information

-- Update Creedmoor Civic Association (from PDF info for Creedmor Civic Association)
UPDATE public.civic_organizations 
SET meeting_info = 'Every 2nd Monday of the month',
    meeting_address = '88-01 Lyman St, Queens, NY 11427'
WHERE name = 'Creedmoor Civic Association';

-- Add general meeting info for Community Boards (typical schedule)
UPDATE public.civic_organizations 
SET meeting_info = 'Typically meets monthly - Contact board office for specific schedule'
WHERE organization_type = 'community_board' 
AND meeting_info IS NULL;

-- Add general meeting info for NYPD Community Councils (typical schedule)
UPDATE public.civic_organizations 
SET meeting_info = 'Typically meets monthly, often first Tuesday or Thursday at 7:00 PM - Contact precinct for exact schedule'
WHERE organization_type = 'police_council' 
AND meeting_info IS NULL;