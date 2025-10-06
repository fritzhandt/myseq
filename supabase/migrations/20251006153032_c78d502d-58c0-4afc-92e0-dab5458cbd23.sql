-- Delete all private (non-government) jobs
DELETE FROM jobs 
WHERE category = 'private';