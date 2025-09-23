-- Create elected officials table
CREATE TABLE public.elected_officials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  office TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('federal', 'state', 'city')),
  category TEXT NOT NULL, -- e.g., 'legislative', 'executive', 'judicial'
  district TEXT,
  party TEXT,
  phone TEXT,
  email TEXT,
  office_address TEXT,
  website TEXT,
  photo_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.elected_officials ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Elected officials are publicly viewable" 
ON public.elected_officials 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create elected officials" 
ON public.elected_officials 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update elected officials" 
ON public.elected_officials 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete elected officials" 
ON public.elected_officials 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_elected_officials_updated_at
BEFORE UPDATE ON public.elected_officials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert comprehensive elected officials data for Southeast Queens
INSERT INTO public.elected_officials (name, title, office, level, category, district, party, phone, email, office_address, website) VALUES

-- FEDERAL LEVEL
-- US Senators (New York State)
('Chuck Schumer', 'U.S. Senator', 'U.S. Senate', 'federal', 'legislative', 'New York State', 'Democratic', '(718) 542-5420', 'senator@schumer.senate.gov', '15 Henry Street, Hempstead, NY 11550', 'www.schumer.senate.gov'),
('Kirsten Gillibrand', 'U.S. Senator', 'U.S. Senate', 'federal', 'legislative', 'New York State', 'Democratic', '(518) 431-0120', 'gillibrand.senate.gov/contact', 'Leo W. O''Brien Federal Building, Albany, NY 12207', 'www.gillibrand.senate.gov'),

-- US Representatives (SEQ Congressional Districts)
('Gregory Meeks', 'U.S. Representative', 'U.S. House of Representatives', 'federal', 'legislative', '5th Congressional District', 'Democratic', '(718) 725-6000', 'info@meeks.house.gov', '153-01 Jamaica Avenue, Jamaica, NY 11432', 'meeks.house.gov'),
('Grace Meng', 'U.S. Representative', 'U.S. House of Representatives', 'federal', 'legislative', '6th Congressional District', 'Democratic', '(718) 358-6364', 'meng.house.gov/contact', '40-13 159th Street, Flushing, NY 11358', 'meng.house.gov'),

-- STATE LEVEL - EXECUTIVE
('Kathy Hochul', 'Governor', 'New York State', 'state', 'executive', 'New York State', 'Democratic', '(518) 474-8390', 'governor.ny.gov/content/governor-contact-form', 'NYS State Capitol Building, Albany, NY 12224', 'www.governor.ny.gov'),
('Thomas DiNapoli', 'Comptroller', 'New York State', 'state', 'executive', 'New York State', 'Democratic', '(518) 474-4044', 'contactus@osc.ny.gov', '110 State Street, Albany, NY 12236', 'www.osc.state.ny.us'),
('Letitia James', 'Attorney General', 'New York State', 'state', 'executive', 'New York State', 'Democratic', '(212) 416-8000', 'ag.ny.gov/contact-attorney-general', '120 Broadway, New York, NY 10271', 'ag.ny.gov'),

-- STATE LEVEL - LEGISLATIVE (Assembly Members)
('Nantasha Williams', 'Assemblymember', 'NYS Assembly', 'state', 'legislative', 'District 27', 'Democratic', '(718) 723-5412', 'williamsn@nyassembly.gov', '142-15 Rockaway Blvd, Jamaica, NY 11436', 'nyassembly.gov/mem/Nantasha-M-Williams'),
('Stacey Pheffer Amato', 'Assemblymember', 'NYS Assembly', 'state', 'legislative', 'District 23', 'Democratic', '(718) 945-9550', 'pheffer-amatos@nyassembly.gov', '94-11 101st Avenue, Ozone Park, NY 11416', 'nyassembly.gov/mem/Stacey-Pheffer-Amato'),
('Khaleel Anderson', 'Assemblymember', 'NYS Assembly', 'state', 'legislative', 'District 31', 'Democratic', '(718) 322-4958', 'andersonk@nyassembly.gov', '1925 Linden Blvd, Elmont, NY 11003', 'nyassembly.gov/mem/Khaleel-M-Anderson'),

-- STATE LEVEL - LEGISLATIVE (State Senators)
('Leroy Comrie', 'State Senator', 'NYS Senate', 'state', 'legislative', 'District 14', 'Democratic', '(718) 765-3925', 'lcomrie@nysenate.gov', '113-43 Farmers Blvd, St. Albans, NY 11412', 'www.nysenate.gov/senators/leroy-comrie'),
('John Liu', 'State Senator', 'NYS Senate', 'state', 'legislative', 'District 11', 'Democratic', '(718) 357-3094', 'liu@nysenate.gov', '142-20 37th Avenue, Flushing, NY 11354', 'www.nysenate.gov/senators/john-c-liu'),
('James Sanders Jr.', 'State Senator', 'NYS Senate', 'state', 'legislative', 'District 10', 'Democratic', '(718) 327-4629', 'sanders@nysenate.gov', '142-01 Rockaway Blvd, Jamaica, NY 11436', 'www.nysenate.gov/senators/james-sanders-jr'),

-- CITY LEVEL - EXECUTIVE
('Eric Adams', 'Mayor', 'New York City', 'city', 'executive', 'New York City', 'Democratic', '311', 'mayor@cityhall.nyc.gov', 'City Hall, New York, NY 10007', 'www1.nyc.gov/office-of-the-mayor'),
('Jumaane Williams', 'Public Advocate', 'New York City', 'city', 'executive', 'New York City', 'Democratic', '(212) 669-7200', 'GetHelp@advocate.nyc.gov', '1 Centre Street, 15th Floor, New York, NY 10007', 'advocate.nyc.gov'),
('Donovan Richards', 'Borough President', 'Queens Borough', 'city', 'executive', 'Queens', 'Democratic', '(718) 286-3000', 'info@queensbp.org', '120-55 Queens Blvd, Kew Gardens, NY 11424', 'www.queensbp.org'),

-- CITY LEVEL - PROSECUTORS
('Alvin Bragg', 'District Attorney', 'Manhattan DA', 'city', 'prosecutor', 'Manhattan', 'Democratic', '(212) 335-9000', 'contactDA@dany.nyc.gov', '1 Hogan Place, New York, NY 10013', 'www.manhattanda.org'),
('Melinda Katz', 'District Attorney', 'Queens DA', 'city', 'prosecutor', 'Queens', 'Democratic', '(718) 286-6000', 'QDA@queensda.org', '125-01 Queens Blvd, Kew Gardens, NY 11415', 'www.queensda.org'),

-- CITY LEVEL - LEGISLATIVE (City Council Members)
('Adrienne Adams', 'Council Speaker', 'NYC Council', 'city', 'legislative', 'District 28', 'Democratic', '(718) 206-2068', 'speakeradams@council.nyc.gov', '213-10 Hillside Avenue, Queens Village, NY 11427', 'council.nyc.gov/district-28'),
('Nantasha Williams', 'Council Member', 'NYC Council', 'city', 'legislative', 'District 27', 'Democratic', '(718) 883-5606', 'district27@council.nyc.gov', '31-09 Newtown Avenue, Astoria, NY 11102', 'council.nyc.gov/district-27'),
('Joann Ariola', 'Council Member', 'NYC Council', 'city', 'legislative', 'District 32', 'Republican', '(718) 945-0550', 'district32@council.nyc.gov', '94-06 101st Avenue, Ozone Park, NY 11416', 'council.nyc.gov/district-32'),
('Lynn Schulman', 'Council Member', 'NYC Council', 'city', 'legislative', 'District 29', 'Democratic', '(718) 217-4969', 'district29@council.nyc.gov', '75-16 Metropolitan Avenue, Middle Village, NY 11379', 'council.nyc.gov/district-29'),
('Sandra Ung', 'Council Member', 'NYC Council', 'city', 'legislative', 'District 20', 'Democratic', '(718) 888-8747', 'district20@council.nyc.gov', '41-60 Main Street, Flushing, NY 11355', 'council.nyc.gov/district-20');