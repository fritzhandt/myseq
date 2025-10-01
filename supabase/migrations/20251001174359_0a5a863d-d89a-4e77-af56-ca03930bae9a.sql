
-- Update logos for organizations from the PDF document
UPDATE public.resources
SET logo_url = CASE organization_name
  WHEN 'Blaque Resource Network' THEN '/resource-logos/blaque-resource-network-logo.jpg'
  WHEN 'JFK Gateway' THEN '/resource-logos/jfk-gateway-logo.png'
  WHEN 'Bellerose BID' THEN '/resource-logos/bellerose-bid-logo.jpg'
  WHEN 'Southeast Queens Chamber of Commerce' THEN '/resource-logos/seqc-logo.png'
  WHEN 'Eastern Queens Alliance' THEN '/resource-logos/eastern-queens-alliance-logo.jpg'
  WHEN 'Southeast Queens Residential Environmental Justice Coalition' THEN '/resource-logos/sqrejc-logo.png'
  WHEN 'Afrikan Poetry Theatre' THEN '/resource-logos/afrikan-poetry-theatre-logo.jpg'
  WHEN 'Glass Dolls & Toy Soldiers Dance Company' THEN '/resource-logos/glass-dolls-toy-soldiers-logo.jpg'
  WHEN 'United Black Men of Queens Foundation' THEN '/resource-logos/ubmq-logo-new.png'
  WHEN 'Kappa Alpha Psi Queens Alumni' THEN '/resource-logos/kappa-alpha-psi-logo-new.png'
  WHEN 'Omega Psi Phi Queens Alumni' THEN '/resource-logos/omega-psi-phi-logo-new.png'
  WHEN 'Phi Beta Sigma Queens Alumni' THEN '/resource-logos/phi-beta-sigma-logo-new.png'
  WHEN 'Alpha Phi Alpha Queens Alumni' THEN '/resource-logos/alpha-phi-alpha-logo-new.png'
  WHEN 'Sigma Gamma Rho Queens Alumni' THEN '/resource-logos/sigma-gamma-rho-logo-new.png'
  WHEN 'Delta Sigma Theta Queens Alumni' THEN '/resource-logos/delta-sigma-theta-logo-new.png'
  WHEN 'American Legion Post 483' THEN '/resource-logos/american-legion-post-483-logo.png'
  WHEN 'Project New Yorker' THEN '/resource-logos/project-new-yorker-logo.jpg'
  WHEN 'NAACP Jamaica Branch' THEN '/resource-logos/naacp-jamaica-logo.png'
  WHEN 'A Better Jamaica' THEN '/resource-logos/a-better-jamaica-logo.png'
  WHEN 'Jamaica 311' THEN '/resource-logos/jamaica-311-logo.png'
  WHEN 'Showing Hearts Foundation' THEN '/resource-logos/showing-hearts-foundation-logo.png'
  WHEN 'Rising Ground' THEN '/resource-logos/rising-ground-logo.png'
  WHEN 'Thomas White Junior Foundation' THEN '/resource-logos/thomas-white-jr-foundation-logo.png'
  WHEN 'Life Camp' THEN '/resource-logos/life-camp-logo.jpg'
  WHEN '100 Suits' THEN '/resource-logos/100-suits-logo.png'
  WHEN 'NY Softball Cricket League' THEN '/resource-logos/ny-softball-cricket-league-logo.png'
  ELSE logo_url
END,
updated_at = now()
WHERE organization_name IN (
  'Blaque Resource Network', 'JFK Gateway', 'Bellerose BID', 
  'Southeast Queens Chamber of Commerce', 'Eastern Queens Alliance',
  'Southeast Queens Residential Environmental Justice Coalition',
  'Afrikan Poetry Theatre', 'Glass Dolls & Toy Soldiers Dance Company',
  'United Black Men of Queens Foundation', 'Kappa Alpha Psi Queens Alumni',
  'Omega Psi Phi Queens Alumni', 'Phi Beta Sigma Queens Alumni',
  'Alpha Phi Alpha Queens Alumni', 'Sigma Gamma Rho Queens Alumni',
  'Delta Sigma Theta Queens Alumni', 'American Legion Post 483',
  'Project New Yorker', 'NAACP Jamaica Branch', 'A Better Jamaica',
  'Jamaica 311', 'Showing Hearts Foundation', 'Rising Ground',
  'Thomas White Junior Foundation', 'Life Camp', '100 Suits',
  'NY Softball Cricket League'
);
