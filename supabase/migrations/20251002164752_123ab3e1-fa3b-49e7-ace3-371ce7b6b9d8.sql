-- Move Southeast Queens Chamber of Commerce to business opportunities
UPDATE resources 
SET type = 'business_opportunity', updated_at = now()
WHERE id = '91911709-8320-4ab3-8b47-a8a506802111';