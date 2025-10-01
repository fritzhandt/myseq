-- Update Alpha Phi Alpha Queens Alumni email
UPDATE public.resources 
SET 
  email = 'info@zzlalphas.org',
  updated_at = now()
WHERE organization_name = 'Alpha Phi Alpha Queens Alumni';