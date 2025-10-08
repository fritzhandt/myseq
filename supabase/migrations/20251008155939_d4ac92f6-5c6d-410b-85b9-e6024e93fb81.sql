-- Fix employer name typo in jobs table
UPDATE jobs 
SET employer = 'Department Of Transportation' 
WHERE employer = 'Department Of Transportaion';