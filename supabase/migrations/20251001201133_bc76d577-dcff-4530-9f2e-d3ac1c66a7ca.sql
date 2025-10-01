-- Fix category name mismatch: change "senior service" to "senior services" (plural)
UPDATE resources
SET 
  categories = array_replace(categories, 'senior service', 'senior services'),
  updated_at = now()
WHERE 'senior service' = ANY(categories);