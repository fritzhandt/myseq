-- Remove duplicate and unwanted elected officials
-- Remove duplicate Adrienne Adams (keep Council Speaker, remove Speaker/Council Member)
DELETE FROM elected_officials WHERE id = '9c2b64cf-2f5a-4a69-9dfe-66376b758ef0';

-- Remove duplicate Nantasha Williams city council entries (keep only the state assembly one)
DELETE FROM elected_officials WHERE id IN ('290e4f67-1894-41f6-ba40-b0935f5cdbc0', 'b6b2e63d-be2d-4224-8fe5-395bd5af3bfd');

-- Remove Pheffer Amato
DELETE FROM elected_officials WHERE id = '197cea9b-6a72-4f34-9181-51e5b32fba97';