-- Update Glass Dolls & Toy Soldiers Dance Company address
UPDATE public.resources 
SET 
  address = '125-20 Sutphin Blvd, Rochdale, NY 11434',
  updated_at = now()
WHERE organization_name = 'Glass Dolls & Toy Soldiers Dance Company';