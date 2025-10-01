
-- Remove duplicate resources, keeping the most complete record for each organization
DELETE FROM public.resources
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (PARTITION BY organization_name ORDER BY 
        (CASE WHEN logo_url IS NOT NULL AND logo_url != '' THEN 1 ELSE 0 END +
         CASE WHEN cover_photo_url IS NOT NULL AND cover_photo_url != '' THEN 1 ELSE 0 END +
         CASE WHEN website IS NOT NULL AND website != '' THEN 1 ELSE 0 END +
         CASE WHEN email IS NOT NULL AND email != '' THEN 1 ELSE 0 END +
         CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 ELSE 0 END +
         CASE WHEN address IS NOT NULL AND address != '' THEN 1 ELSE 0 END +
         array_length(categories, 1)) DESC,
        created_at ASC
      ) as rank
    FROM public.resources
  ) ranked
  WHERE rank > 1
);
