-- Update photo URLs for city executive officials
UPDATE elected_officials 
SET photo_url = '/officials/eric-adams.jpg'
WHERE name = 'Eric Adams' AND level = 'city' AND category = 'executive';

UPDATE elected_officials 
SET photo_url = '/officials/jumaane-williams.png'
WHERE name = 'Jumaane Williams' AND level = 'city' AND category = 'executive';

UPDATE elected_officials 
SET photo_url = '/officials/brad-lander.jpg'
WHERE name = 'Brad Lander' AND level = 'city' AND category = 'executive';

UPDATE elected_officials 
SET photo_url = '/officials/donovan-richards.jpg'
WHERE name = 'Donovan Richards' AND level = 'city' AND category = 'executive';

UPDATE elected_officials 
SET photo_url = '/officials/melinda-katz.jpg'
WHERE name = 'Melinda Katz' AND level = 'city' AND category = 'executive';