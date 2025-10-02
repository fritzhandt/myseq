-- Move Eastern Queens Alliance to business opportunities
UPDATE resources 
SET type = 'business_opportunity', updated_at = now()
WHERE id = '7650e451-fbdc-44c1-bf84-54b4e712c6a2';