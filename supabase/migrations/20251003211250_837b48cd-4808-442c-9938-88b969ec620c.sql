-- Update Federal Level - U.S. Senate
UPDATE public.elected_officials
SET 
  phone = '(202) 224-6542',
  email = 'https://www.schumer.senate.gov/contact',
  office_address = '780 Third Ave, Suite 2301, New York, NY 10017',
  website = 'https://www.schumer.senate.gov',
  updated_at = now()
WHERE name = 'Chuck Schumer' AND office = 'U.S. Senate';

UPDATE public.elected_officials
SET 
  phone = '(212) 688-6262',
  email = 'https://www.gillibrand.senate.gov/contact/',
  office_address = '780 Third Ave, Suite 2601, New York, NY 10017',
  website = 'https://www.gillibrand.senate.gov',
  updated_at = now()
WHERE name = 'Kirsten Gillibrand' AND office = 'U.S. Senate';

-- Update Federal Level - U.S. House
UPDATE public.elected_officials
SET 
  phone = '(718) 725-6000',
  email = 'https://meeks.house.gov/contact',
  office_address = '153-01 Jamaica Ave, 2nd Fl, Jamaica, NY 11432',
  website = 'https://meeks.house.gov',
  district = 'NY-5',
  updated_at = now()
WHERE name = 'Gregory Meeks' AND office = 'U.S. House';

UPDATE public.elected_officials
SET 
  phone = '(718) 358-6364',
  email = 'https://meng.house.gov/contact/email',
  office_address = '40-13 159th St, Flushing, NY 11358',
  website = 'https://meng.house.gov',
  district = 'NY-6',
  updated_at = now()
WHERE name = 'Grace Meng' AND office = 'U.S. House';

-- Update State Level - NYS Senate
UPDATE public.elected_officials
SET 
  phone = '(718) 765-6359',
  email = 'comrie@nysenate.gov',
  office_address = '113-43 Farmers Blvd, St. Albans, NY 11412',
  website = 'https://www.nysenate.gov/senators/leroy-comrie',
  district = 'District 14',
  updated_at = now()
WHERE name = 'Leroy Comrie' AND category = 'state_senate';

UPDATE public.elected_officials
SET 
  phone = '(718) 523-3069',
  email = 'sanders@nysenate.gov',
  office_address = '142-01 Rockaway Blvd, South Ozone Park, NY 11436',
  website = 'https://www.nysenate.gov/senators/james-sanders-jr',
  district = 'District 10',
  updated_at = now()
WHERE name = 'James Sanders Jr.' AND category = 'state_senate';

UPDATE public.elected_officials
SET 
  phone = '(718) 765-6675',
  email = 'liu@nysenate.gov',
  office_address = '38-50 Bell Blvd, Suite C, Bayside, NY 11361',
  website = 'https://www.nysenate.gov/senators/john-c-liu',
  district = 'District 11',
  updated_at = now()
WHERE name = 'John Liu' AND category = 'state_senate';

UPDATE public.elected_officials
SET 
  phone = '(718) 445-0004',
  email = 'stavisky@nysenate.gov',
  office_address = '142-29 37th Ave, Suite 1, Flushing, NY 11354',
  website = 'https://www.nysenate.gov/senators/toby-ann-stavisky',
  district = 'District 16',
  updated_at = now()
WHERE name = 'Toby Ann Stavisky' AND category = 'state_senate';

-- Update State Level - NYS Assembly
UPDATE public.elected_officials
SET 
  phone = '(718) 479-2333',
  email = 'vanelc@nyassembly.gov',
  office_address = '97-01 Springfield Blvd, Queens Village, NY 11429',
  website = 'https://nyassembly.gov/mem/Clyde-Vanel',
  district = 'District 33',
  updated_at = now()
WHERE name = 'Clyde Vanel' AND category = 'state_assembly';

UPDATE public.elected_officials
SET 
  phone = '(718) 723-5412',
  email = 'hyndmana@nyassembly.gov',
  office_address = '232-06A Merrick Blvd, Springfield Gardens, NY 11413',
  website = 'https://nyassembly.gov/mem/Alicia-Hyndman',
  district = 'District 29',
  updated_at = now()
WHERE name = 'Alicia Hyndman' AND category = 'state_assembly';

UPDATE public.elected_officials
SET 
  name = 'Khaleel M. Anderson',
  phone = '(718) 327-1845',
  email = 'andersonk@nyassembly.gov',
  office_address = '19-31 Mott Ave, Suite 301, Far Rockaway, NY 11691',
  website = 'https://nyassembly.gov/mem/Khaleel-M-Anderson',
  district = 'District 31',
  updated_at = now()
WHERE (name = 'Khaleel Anderson' OR name = 'Khaleel M. Anderson') AND category = 'state_assembly';

UPDATE public.elected_officials
SET 
  phone = '(718) 322-3975',
  email = 'CookV@nyassembly.gov',
  office_address = '142-15 Rockaway Blvd, Jamaica, NY 11436',
  website = 'https://nyassembly.gov/mem/Vivian-E-Cook',
  district = 'District 32',
  updated_at = now()
WHERE name = 'Vivian Cook' AND category = 'state_assembly';

-- Update State Level - Executive
UPDATE public.elected_officials
SET 
  phone = '(518) 474-8390',
  email = 'https://www.governor.ny.gov/content/governor-contact-form',
  office_address = 'NYS State Capitol Building, Albany, NY 12224',
  website = 'https://www.governor.ny.gov',
  updated_at = now()
WHERE name = 'Kathy Hochul' AND title = 'Governor';

UPDATE public.elected_officials
SET 
  phone = '1-800-771-7755',
  email = 'https://ag.ny.gov/contact-attorney-general',
  office_address = '28 Liberty St, New York, NY 10005',
  website = 'https://ag.ny.gov',
  updated_at = now()
WHERE name = 'Letitia James' AND title = 'Attorney General';

UPDATE public.elected_officials
SET 
  phone = '(518) 474-4044',
  email = 'contactus@osc.ny.gov',
  office_address = '110 State St, Albany, NY 12236',
  website = 'https://www.osc.state.ny.us',
  updated_at = now()
WHERE name = 'Thomas DiNapoli' AND title = 'Comptroller';

-- Update City Level - Executive
UPDATE public.elected_officials
SET 
  phone = '(212) 788-3000',
  email = 'https://www.nyc.gov/office-of-the-mayor/contact-the-mayor',
  office_address = 'City Hall, New York, NY 10007',
  website = 'https://www.nyc.gov/office-of-the-mayor',
  updated_at = now()
WHERE name = 'Eric Adams' AND title = 'Mayor';

UPDATE public.elected_officials
SET 
  title = 'Public Advocate',
  phone = '(212) 669-7200',
  email = 'GetHelp@advocate.nyc.gov',
  office_address = '1 Centre St, 15th Fl, New York, NY 10007',
  website = 'https://advocate.nyc.gov',
  updated_at = now()
WHERE name = 'Jumaane D. Williams' AND level = 'city';

UPDATE public.elected_officials
SET 
  phone = '(212) 669-3916',
  email = 'action@comptroller.nyc.gov',
  office_address = 'One Centre St, New York, NY 10007',
  website = 'https://comptroller.nyc.gov',
  updated_at = now()
WHERE name = 'Brad Lander' AND title = 'NYC Comptroller';

UPDATE public.elected_officials
SET 
  phone = '(718) 286-3000',
  email = 'info@queensbp.org',
  office_address = '120-55 Queens Blvd, Kew Gardens, NY 11424',
  website = 'https://queensbp.org',
  updated_at = now()
WHERE name = 'Donovan Richards' AND title = 'Queens Borough President';

UPDATE public.elected_officials
SET 
  phone = '(718) 286-6000',
  email = 'info@queensda.org',
  office_address = '125-01 Queens Blvd, Kew Gardens, NY 11415',
  website = 'https://queensda.org',
  updated_at = now()
WHERE name = 'Melinda Katz' AND title = 'Queens District Attorney';

-- Update City Level - NYC Council
UPDATE public.elected_officials
SET 
  phone = '(718) 206-2068',
  email = 'D28Helps@council.nyc.gov',
  office_address = '165-38A Baisley Blvd, 2nd Fl, Jamaica, NY 11434',
  website = 'https://council.nyc.gov/adrienne-adams',
  district = 'District 28',
  updated_at = now()
WHERE name = 'Adrienne E. Adams' AND category = 'city_council';

UPDATE public.elected_officials
SET 
  phone = '(718) 468-0137',
  email = 'District23@council.nyc.gov',
  office_address = '73-03 Bell Blvd, Oakland Gardens, NY 11364',
  website = 'https://council.nyc.gov/linda-lee',
  district = 'District 23',
  updated_at = now()
WHERE name = 'Linda Lee' AND category = 'city_council';

UPDATE public.elected_officials
SET 
  phone = '(718) 776-3700',
  email = 'District27@council.nyc.gov',
  office_address = '172-12 Linden Blvd, Jamaica, NY 11434',
  website = 'https://council.nyc.gov/nantasha-williams',
  district = 'District 27',
  updated_at = now()
WHERE name = 'Nantasha Williams' AND category = 'city_council';

UPDATE public.elected_officials
SET 
  phone = '(718) 471-7014',
  email = 'District31@council.nyc.gov',
  office_address = '1931 Mott Ave, Suite 410, Far Rockaway, NY 11691',
  website = 'https://council.nyc.gov/selvena-brooks-powers',
  district = 'District 31',
  updated_at = now()
WHERE name = 'Selvena Brooks-Powers' AND category = 'city_council';