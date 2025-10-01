-- Remove Recreational category from King of Kings Foundation
UPDATE resources 
SET 
  categories = ARRAY['conflict management']::text[],
  updated_at = now()
WHERE id = '650f1775-8566-41bb-b425-f8757f87e006';