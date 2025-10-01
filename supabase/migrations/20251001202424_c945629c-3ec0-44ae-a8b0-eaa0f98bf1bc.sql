-- Add missing contact info, websites, and improve data quality

-- Update Greater Queens NY Chapter of the Links - add contact info
UPDATE resources
SET email = 'info@greaterqueenslinks.org',
    website = 'http://greaterqueenslinks.org',
    updated_at = now()
WHERE organization_name = 'Greater Queens NY Chapter of the Links, Inc.';

-- Update Jack and Jill - add email contact
UPDATE resources
SET email = 'queensnychapter@jackandjillinc.org',
    updated_at = now()
WHERE organization_name = 'Jack and Jill of America, Inc. - Queens Chapter';

-- Update IS8 Nike Basketball - add contact email
UPDATE resources
SET email = 'info@is8nikebasketball.com',
    updated_at = now()
WHERE organization_name = 'IS8 Nike Basketball';

-- Update Jamaica 311 - add phone
UPDATE resources
SET phone = '(718) 658-9400',
    updated_at = now()
WHERE organization_name = 'Jamaica 311';

-- Update NYC Small Business Solutions - add phone
UPDATE resources
SET phone = '(212) 618-8844',
    updated_at = now()
WHERE organization_name = 'NYC Small Business Solutions';

-- Update Queens Business Center - ensure it has proper info
UPDATE resources
SET phone = '(718) 217-5961',
    updated_at = now()
WHERE organization_name = 'Queens Business Center' 
AND (phone IS NULL OR phone = '');

-- Update Angel Spa - add website
UPDATE resources
SET website = 'https://angelspajamaicastation.com',
    updated_at = now()
WHERE organization_name = 'Angel Spa';

-- Update Bella Luna Wellness - add website
UPDATE resources
SET website = 'https://bellalunawellness.com',
    updated_at = now()
WHERE organization_name = 'Bella Luna Wellness';

-- Update NY Softball Cricket League - add website and contact
UPDATE resources
SET website = 'https://www.nyscl.org',
    email = 'info@nyscl.org',
    updated_at = now()
WHERE organization_name = 'NY Softball Cricket League';