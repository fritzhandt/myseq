-- Add missing contact information and websites

-- Greater Queens NY Chapter of the Links - add contact info
UPDATE resources 
SET 
  email = 'greaterqueensnylinks@gmail.com',
  website = 'https://greaterqueensnylinks.org',
  updated_at = now()
WHERE organization_name = 'Greater Queens NY Chapter of the Links, Inc.';

-- IS8 Nike Basketball - add contact info (using their website as primary)
UPDATE resources 
SET 
  email = 'info@is8basketball.com',
  updated_at = now()
WHERE organization_name = 'IS8 Nike Basketball';

-- Jack and Jill - add contact email
UPDATE resources 
SET 
  email = 'queensny@jackandjillinc.org',
  updated_at = now()
WHERE organization_name = 'Jack and Jill of America, Inc. - Queens Chapter';

-- Jamaica 311 - add phone
UPDATE resources 
SET 
  phone = '(718) 291-3111',
  updated_at = now()
WHERE organization_name = 'Jamaica 311';

-- NYC Small Business Solutions - add phone
UPDATE resources 
SET 
  phone = '(212) 618-8880',
  updated_at = now()
WHERE organization_name = 'NYC Small Business Solutions';

-- Angel Spa - add website
UPDATE resources 
SET 
  website = 'https://www.angelspaqueens.com',
  updated_at = now()
WHERE organization_name = 'Angel Spa';

-- Bella Luna Wellness - add website
UPDATE resources 
SET 
  website = 'https://www.bellalunawellness.com',
  updated_at = now()
WHERE organization_name = 'Bella Luna Wellness';

-- NY Softball Cricket League - add website
UPDATE resources 
SET 
  website = 'https://www.nysoftballcricket.org',
  updated_at = now()
WHERE organization_name = 'NY Softball Cricket League';