-- Delete duplicate private sector jobs, keeping only the most recent one per employer/title/location
DELETE FROM jobs
WHERE id IN (
  SELECT unnest(ids[2:]) -- Keep first (most recent), delete the rest
  FROM (
    SELECT array_agg(id ORDER BY created_at DESC) as ids
    FROM jobs
    WHERE category IN ('private', 'private_sector')
    GROUP BY employer, title, location
    HAVING COUNT(*) > 1
  ) duplicates
);