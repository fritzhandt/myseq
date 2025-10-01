-- Move Bellerose BID to Business Opportunities section
UPDATE public.resources 
SET 
  type = 'business_opportunity',
  updated_at = now()
WHERE organization_name = 'Bellerose BID';