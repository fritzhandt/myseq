-- Update titles for NYC executives
UPDATE public.elected_officials 
SET title = 'New York City Public Advocate', updated_at = now()
WHERE name = 'Jumaane Williams';

UPDATE public.elected_officials 
SET title = 'New York City Comptroller', updated_at = now()
WHERE name = 'Brad Lander';

UPDATE public.elected_officials 
SET title = 'Queens Borough President', updated_at = now()
WHERE name = 'Donovan Richards';

UPDATE public.elected_officials 
SET title = 'Queens District Attorney', updated_at = now()
WHERE name = 'Melinda Katz';