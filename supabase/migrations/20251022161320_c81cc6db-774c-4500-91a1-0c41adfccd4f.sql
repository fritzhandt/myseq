-- Fix title formatting for Khaleel Anderson and Toby Ann Stavisky
UPDATE elected_officials 
SET title = 'Assembly Member'
WHERE name = 'Khaleel Anderson';

UPDATE elected_officials 
SET title = 'State Senator'
WHERE name = 'Toby Ann Stavisky';