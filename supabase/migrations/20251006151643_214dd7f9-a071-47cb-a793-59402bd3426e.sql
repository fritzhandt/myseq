-- Update photo URLs for federal elected officials
UPDATE elected_officials 
SET photo_url = '/officials/chuck-schumer.jpg'
WHERE name = 'Chuck Schumer';

UPDATE elected_officials 
SET photo_url = '/officials/kirsten-gillibrand.jpg'
WHERE name = 'Kirsten Gillibrand';

UPDATE elected_officials 
SET photo_url = '/officials/gregory-meeks.jpg'
WHERE name = 'Gregory Meeks';

UPDATE elected_officials 
SET photo_url = '/officials/grace-meng.jpg'
WHERE name = 'Grace Meng';