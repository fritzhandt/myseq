-- Update Project New Yorker logo
UPDATE public.resources 
SET 
  logo_url = '/resource-logos/project-new-yorker-logo-correct.jpg',
  updated_at = now()
WHERE id = 'ff97a0bc-1e21-4aeb-9b4b-599d3893bc55';

-- Update Queens Village Committee for Mental Health logo
UPDATE public.resources 
SET 
  logo_url = '/resource-logos/acacia-queens-village-logo.png',
  updated_at = now()
WHERE id = '5411b0de-0d97-44b7-8af5-e6336c347c30';

-- Update Acacia Network - Queens Village Committee for Mental Health for J-CAP, Inc. logo
UPDATE public.resources 
SET 
  logo_url = '/resource-logos/acacia-queens-village-logo.png',
  updated_at = now()
WHERE id = 'eec310ef-6247-4fa1-9c84-d2e56a27a33a';