
-- Update logos for organizations where we successfully downloaded them
UPDATE public.resources
SET logo_url = CASE organization_name
  WHEN '32 North' THEN '/resource-logos/32-north-logo.png'
  ELSE logo_url
END,
updated_at = now()
WHERE organization_name IN ('32 North')
AND (logo_url IS NULL OR logo_url = '');
