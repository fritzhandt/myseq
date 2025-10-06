-- Update Rockaway Civic Association with phone and email
UPDATE civic_organizations 
SET contact_info = jsonb_set(
  jsonb_set(
    contact_info,
    '{phone}',
    '"(646) 404-4167"'
  ),
  '{email}',
  '"admin@rockawaycivic.com"'
)
WHERE id = '9dfc2920-6277-4e01-8afc-a810b98cbce4';

-- Update Floral Park Bellerose Indian Merchants Association with phone
UPDATE civic_organizations 
SET contact_info = jsonb_set(
  contact_info,
  '{phone}',
  '"(516) 263-9624"'
)
WHERE id = 'eb7ee606-ca92-4450-adea-eea0d7838fbc';

-- Update Bellerose Hillside Civic Association with phone
UPDATE civic_organizations 
SET contact_info = jsonb_set(
  contact_info,
  '{phone}',
  '"(224) 2516"'
)
WHERE id = '675c6107-e662-4410-92a6-097d31cc01c1';