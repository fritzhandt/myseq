-- Change Greater Jamaica Development Corporation to Greater Nexus for business opportunity
UPDATE public.resources 
SET 
  organization_name = 'Greater Nexus',
  updated_at = now()
WHERE organization_name = 'Greater Jamaica Development Corporation' 
  AND type = 'business_opportunity';