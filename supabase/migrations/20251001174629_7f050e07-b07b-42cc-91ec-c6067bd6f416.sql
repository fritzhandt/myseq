
-- Update websites for organizations from the PDF document
UPDATE public.resources
SET website = CASE organization_name
  WHEN 'Blaque Resource Network' THEN 'https://www.facebook.com/groups/joinblaque/'
  WHEN 'JFK Gateway' THEN 'https://www.gatewayjfk.org/'
  WHEN 'Bellerose BID' THEN 'https://www.bellerosevillage.org/'
  WHEN 'Southeast Queens Chamber of Commerce' THEN 'https://seqcoc.org/'
  WHEN 'Eastern Queens Alliance' THEN 'https://easternqueensalliance.org/'
  WHEN 'Southeast Queens Residential Environmental Justice Coalition' THEN 'https://www.sqrejc.org/'
  WHEN 'Afrikan Poetry Theatre' THEN 'https://www.theafrikanpoetrytheatre.org/'
  WHEN 'Glass Dolls & Toy Soldiers Dance Company' THEN 'https://www.glassdollsandtoysoldiers.com/'
  WHEN 'Golden Dancerettes' THEN 'https://thegoldendancerettes.com/'
  WHEN 'United Black Men of Queens Foundation' THEN 'https://unitedblackmenofqueens.org/'
  WHEN 'Kappa Alpha Psi Queens Alumni' THEN 'https://www.qanupes.org/'
  WHEN 'Omega Psi Phi Queens Alumni' THEN 'https://www.nuomicron1947.com/'
  WHEN 'Phi Beta Sigma Queens Alumni' THEN 'https://www.grs1914.com/'
  WHEN 'Alpha Phi Alpha Queens Alumni' THEN 'https://www.zzlalphas.org/chapter'
  WHEN 'Sigma Gamma Rho Queens Alumni' THEN 'https://www.sgrhoqueens1922.org/'
  WHEN 'Delta Sigma Theta Queens Alumni' THEN 'https://www.dstquac.org/'
  WHEN 'Project New Yorker' THEN 'https://projectnewyorker.org/'
  WHEN 'NAACP Jamaica Branch' THEN 'https://naacp.org/'
  WHEN 'A Better Jamaica' THEN 'https://abetterjamaica.org/'
  WHEN 'Jamaica 311' THEN 'https://jamaica311.com/'
  WHEN 'Showing Hearts Foundation' THEN 'https://www.showinghearts.org/'
  WHEN 'Rising Ground' THEN 'https://www.risingground.org/jamaica-community-partnership/'
  WHEN 'Thomas White Junior Foundation' THEN 'https://www.thomaswhitejr.org/'
  WHEN 'King of Kings Foundation' THEN 'https://kingofkingsfoundation.org/'
  WHEN 'Life Camp' THEN 'https://www.peaceisalifestyle.com/'
  WHEN '100 Suits' THEN 'https://www.100suitsnyc.org/'
  ELSE website
END,
updated_at = now()
WHERE organization_name IN (
  'Blaque Resource Network', 'JFK Gateway', 'Bellerose BID',
  'Southeast Queens Chamber of Commerce', 'Eastern Queens Alliance',
  'Southeast Queens Residential Environmental Justice Coalition',
  'Afrikan Poetry Theatre', 'Glass Dolls & Toy Soldiers Dance Company',
  'Golden Dancerettes', 'United Black Men of Queens Foundation',
  'Kappa Alpha Psi Queens Alumni', 'Omega Psi Phi Queens Alumni',
  'Phi Beta Sigma Queens Alumni', 'Alpha Phi Alpha Queens Alumni',
  'Sigma Gamma Rho Queens Alumni', 'Delta Sigma Theta Queens Alumni',
  'Project New Yorker', 'NAACP Jamaica Branch', 'A Better Jamaica',
  'Jamaica 311', 'Showing Hearts Foundation', 'Rising Ground',
  'Thomas White Junior Foundation', 'King of Kings Foundation',
  'Life Camp', '100 Suits'
)
AND (website IS NULL OR website = '');
