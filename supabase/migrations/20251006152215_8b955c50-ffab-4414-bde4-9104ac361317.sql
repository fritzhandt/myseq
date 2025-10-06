-- Update photo URLs for city council members
UPDATE elected_officials 
SET photo_url = '/officials/linda-lee.jpg'
WHERE name = 'Linda Lee' AND level = 'city' AND category = 'legislative';

UPDATE elected_officials 
SET photo_url = '/officials/selvena-brooks-powers.jpg'
WHERE name = 'Selvena Brooks-Powers' AND level = 'city' AND category = 'legislative';

UPDATE elected_officials 
SET photo_url = '/officials/nantasha-williams.jpg'
WHERE name = 'Nantasha Williams' AND level = 'city' AND category = 'legislative';

UPDATE elected_officials 
SET photo_url = '/officials/adrienne-adams.jpg'
WHERE name = 'Adrienne Adams' AND level = 'city' AND category = 'legislative';