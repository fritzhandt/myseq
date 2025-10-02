-- Update all lowercase category names to match the proper case format
UPDATE public.resources 
SET categories = ARRAY(
  SELECT CASE 
    WHEN unnest = 'arts' THEN 'Arts'
    WHEN unnest = 'sports' THEN 'Sports'
    WHEN unnest = 'youth' THEN 'Youth'
    WHEN unnest = 'senior services' THEN 'Senior Services'
    WHEN unnest = 'mental health/wellness' THEN 'Mental Health/Wellness'
    WHEN unnest = 'recreational' THEN 'Community Resources'
    WHEN unnest = 'educational' THEN 'Educational'
    WHEN unnest = 'conflict management' THEN 'Conflict Management'
    ELSE unnest
  END
  FROM unnest(categories) AS unnest
)
WHERE EXISTS (
  SELECT 1 FROM unnest(categories) AS cat 
  WHERE cat IN ('arts', 'sports', 'youth', 'senior services', 'mental health/wellness', 'recreational', 'educational', 'conflict management')
);