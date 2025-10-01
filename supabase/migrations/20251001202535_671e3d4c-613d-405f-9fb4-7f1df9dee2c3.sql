-- Delete duplicate entries - keep only the most recent one with complete data for each organization
-- We'll keep the one with logo_url populated if available

-- United Black Golfers Association - keep the one with logo
DELETE FROM resources 
WHERE organization_name = 'United Black Golfers Association' 
AND id NOT IN (
  SELECT id FROM resources 
  WHERE organization_name = 'United Black Golfers Association' 
  AND logo_url IS NOT NULL 
  ORDER BY created_at DESC LIMIT 1
);

-- New York Surf School - keep the one with logo
DELETE FROM resources 
WHERE organization_name = 'New York Surf School' 
AND id NOT IN (
  SELECT id FROM resources 
  WHERE organization_name = 'New York Surf School' 
  AND logo_url IS NOT NULL 
  ORDER BY created_at DESC LIMIT 1
);

-- Queens Alliance Baseball League - keep most recent
DELETE FROM resources 
WHERE organization_name = 'Queens Alliance Baseball League' 
AND id NOT IN (
  SELECT id FROM resources 
  WHERE organization_name = 'Queens Alliance Baseball League' 
  ORDER BY created_at DESC LIMIT 1
);

-- Queens United Cricket Academy - keep the one with logo
DELETE FROM resources 
WHERE organization_name = 'Queens United Cricket Academy' 
AND id NOT IN (
  SELECT id FROM resources 
  WHERE organization_name = 'Queens United Cricket Academy' 
  AND logo_url IS NOT NULL 
  ORDER BY created_at DESC LIMIT 1
);

-- IS8 Nike Basketball - keep most recent
DELETE FROM resources 
WHERE organization_name = 'IS8 Nike Basketball' 
AND id NOT IN (
  SELECT id FROM resources 
  WHERE organization_name = 'IS8 Nike Basketball' 
  ORDER BY created_at DESC LIMIT 1
);

-- Police Athletic League PAL NYC - keep the one with logo
DELETE FROM resources 
WHERE organization_name = 'Police Athletic League PAL NYC' 
AND id NOT IN (
  SELECT id FROM resources 
  WHERE organization_name = 'Police Athletic League PAL NYC' 
  AND logo_url IS NOT NULL 
  ORDER BY created_at DESC LIMIT 1
);

-- National Council of Negro Women (NCNW) Queens County - keep the one with logo
DELETE FROM resources 
WHERE organization_name = 'National Council of Negro Women (NCNW) Queens County' 
AND id NOT IN (
  SELECT id FROM resources 
  WHERE organization_name = 'National Council of Negro Women (NCNW) Queens County' 
  AND logo_url IS NOT NULL 
  ORDER BY created_at DESC LIMIT 1
);

-- Jack and Jill of America, Inc. - Queens Chapter - keep the one with logo
DELETE FROM resources 
WHERE organization_name = 'Jack and Jill of America, Inc. - Queens Chapter' 
AND id NOT IN (
  SELECT id FROM resources 
  WHERE organization_name = 'Jack and Jill of America, Inc. - Queens Chapter' 
  AND logo_url IS NOT NULL 
  ORDER BY created_at DESC LIMIT 1
);

-- Greater Queens NY Chapter of the Links, Inc. - keep most recent
DELETE FROM resources 
WHERE organization_name = 'Greater Queens NY Chapter of the Links, Inc.' 
AND id NOT IN (
  SELECT id FROM resources 
  WHERE organization_name = 'Greater Queens NY Chapter of the Links, Inc.' 
  ORDER BY created_at DESC LIMIT 1
);

-- The Kiwanis of the Rockaways - keep the one with logo
DELETE FROM resources 
WHERE organization_name = 'The Kiwanis of the Rockaways' 
AND id NOT IN (
  SELECT id FROM resources 
  WHERE organization_name = 'The Kiwanis of the Rockaways' 
  AND logo_url IS NOT NULL 
  ORDER BY created_at DESC LIMIT 1
);

-- Queens East Division Kiwanis Cambria Heights - keep the one with logo
DELETE FROM resources 
WHERE organization_name = 'Queens East Division Kiwanis Cambria Heights' 
AND id NOT IN (
  SELECT id FROM resources 
  WHERE organization_name = 'Queens East Division Kiwanis Cambria Heights' 
  AND logo_url IS NOT NULL 
  ORDER BY created_at DESC LIMIT 1
);

-- Rotary Club of South Queens - keep the one with logo
DELETE FROM resources 
WHERE organization_name = 'Rotary Club of South Queens' 
AND id NOT IN (
  SELECT id FROM resources 
  WHERE organization_name = 'Rotary Club of South Queens' 
  AND logo_url IS NOT NULL 
  ORDER BY created_at DESC LIMIT 1
);

-- The Queens United Lions Club - keep the one with logo
DELETE FROM resources 
WHERE organization_name = 'The Queens United Lions Club' 
AND id NOT IN (
  SELECT id FROM resources 
  WHERE organization_name = 'The Queens United Lions Club' 
  AND logo_url IS NOT NULL 
  ORDER BY created_at DESC LIMIT 1
);

-- Boy Scouts Troop 333 - keep the one with logo
DELETE FROM resources 
WHERE organization_name = 'Boy Scouts Troop 333' 
AND id NOT IN (
  SELECT id FROM resources 
  WHERE organization_name = 'Boy Scouts Troop 333' 
  AND logo_url IS NOT NULL 
  ORDER BY created_at DESC LIMIT 1
);

-- HAUP - keep the one with logo
DELETE FROM resources 
WHERE organization_name = 'HAUP' 
AND id NOT IN (
  SELECT id FROM resources 
  WHERE organization_name = 'HAUP' 
  AND logo_url IS NOT NULL 
  ORDER BY created_at DESC LIMIT 1
);

-- Igbo Organization Inc. - keep the one with logo
DELETE FROM resources 
WHERE organization_name = 'Igbo Organization Inc.' 
AND id NOT IN (
  SELECT id FROM resources 
  WHERE organization_name = 'Igbo Organization Inc.' 
  AND logo_url IS NOT NULL 
  ORDER BY created_at DESC LIMIT 1
);