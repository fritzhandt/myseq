-- Update St. Albans Civic Improvement Association with email
UPDATE civic_organizations 
SET contact_info = jsonb_set(
  contact_info,
  '{email}',
  '"sacia1906@aol.com"'
)
WHERE id = '2fa985db-548a-47a7-ae98-9395b41c52dc';

-- Update Bellerose Commonwealth Civic Association with email
UPDATE civic_organizations 
SET contact_info = jsonb_set(
  contact_info,
  '{email}',
  '"bccaqueens@gmail.com"'
)
WHERE id = '3657be0a-899c-4eff-bf16-1d42b4918dc4';

-- Update Rockaway Civic Association with additional email (RockawayCivic1@aol.com)
UPDATE civic_organizations 
SET contact_info = jsonb_set(
  contact_info,
  '{email}',
  '"RockawayCivic1@aol.com"'
)
WHERE id = '9dfc2920-6277-4e01-8afc-a810b98cbce4';