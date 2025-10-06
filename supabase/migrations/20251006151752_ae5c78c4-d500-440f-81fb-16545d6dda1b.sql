-- Update photo URLs for state executive officials
UPDATE elected_officials 
SET photo_url = '/officials/kathy-hochul.jpg'
WHERE name = 'Kathy Hochul' AND level = 'state' AND category = 'executive';

UPDATE elected_officials 
SET photo_url = '/officials/letitia-james.jpg'
WHERE name = 'Letitia James' AND level = 'state' AND category = 'executive';

UPDATE elected_officials 
SET photo_url = '/officials/thomas-dinapoli.jpg'
WHERE name = 'Thomas DiNapoli' AND level = 'state' AND category = 'executive';