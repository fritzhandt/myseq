-- Update Addisleigh Park Civic Association contact info with phone and corrected email
UPDATE civic_organizations 
SET contact_info = jsonb_set(
  jsonb_set(
    contact_info,
    '{phone}',
    '"(516) 939-8717"'
  ),
  '{email}',
  '"info@AddisleighParkCivic.org"'
)
WHERE id = '639e25fb-5a11-4f78-9661-d4a0dec1984a';