-- Move JFK Gateway to business opportunities
UPDATE resources 
SET type = 'business_opportunity', updated_at = now()
WHERE id = '8257a1a2-074d-4529-85c0-ac8f4cd94297';