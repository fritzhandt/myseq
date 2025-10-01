-- Update IS8 Nike Basketball logo
UPDATE resources 
SET 
  logo_url = '/resource-logos/is8-nike-basketball-logo.jpg',
  updated_at = now()
WHERE organization_name = 'IS8 Nike Basketball';

-- Update Queens Alliance Baseball League logo
UPDATE resources 
SET 
  logo_url = '/resource-logos/queens-alliance-baseball-logo.jpg',
  updated_at = now()
WHERE organization_name = 'Queens Alliance Baseball League';