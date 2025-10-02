-- Add Educational Resources
INSERT INTO public.resources (organization_name, description, website, logo_url, email, address, phone, type, categories) VALUES 
-- Educational
('Empower My Hood', 'Empower My Hood is a nonprofit organization dedicated to advancing college access and success. Our team is made up of young Black professionals who share roots in underserved communities and are committed to creating opportunities for the next generation.', 'https://www.emhinc.org/', '/resource-logos/empower-my-hood-logo.png', 'info@emhinc.org', '227-27 111th Avenue Queens Village, NY 11429', NULL, 'resource', ARRAY['Educational']::text[]),

('Young Men Strong', 'Est. 2012; YMS is a global umbrella membership organization designed to collaborate and uplift agencies, programs, and businesses that specifically empower, educate, engage and revitalize the strength of African American, Latinx American, and other Ethnic men of color through media, consulting, and mentorship.', 'https://youngmenstrong.com/', '/resource-logos/young-men-strong-logo.png', 'info@youngmenstrong.com', '260 Elmont Road Ste. 30643 Elmont, NY 11003', NULL, 'resource', ARRAY['Educational']::text[]),

('Khan Tutorial', '30 YEARS OF EXCELLENCE. We foster an environment for the intellectually curious and relentless. As products of immigrant parents, we understand the importance of education and making sure our children start off on the right foot.', 'https://khanstutorial.com/khans-tutorial-jamaica/', '/resource-logos/khan-tutorial-logo.png', NULL, '178-05 Hillside Avenue, Jamaica, NY 11432', '(718) 938-9451', 'resource', ARRAY['Educational']::text[]),

('Kumon Math and Reading Center of St. Albans', 'A learning center offering personalized math and reading programs to help students build strong academic skills.', 'https://www.kumon.com/st-albans-ny', '/resource-logos/kumon-logo.jpg', 'stalbans_ny@ikumon.com', '180-29 Linden Blvd, St. Albans, NY 11434', '(718) 657-5864', 'resource', ARRAY['Educational']::text[]),

('DreamchaserNYC', 'A youth development organization offering creative arts, mentorship, and empowerment programs for young people.', 'https://dreamchasersnyc.com', '/resource-logos/dreamchasernyc-logo.jpg', 'dreamchasersnycinfo@gmail.com', NULL, '(347) 210-3921', 'resource', ARRAY['Educational']::text[]),

('You Can Go To College', 'An initiative that helps students from underserved communities navigate college admissions and access higher education.', 'http://www.youcangotocollege.net/dclark_let1a.htm', '/resource-logos/you-can-go-to-college-logo.jpg', NULL, NULL, '(718) 658-6255', 'resource', ARRAY['Educational']::text[]),

-- Legal Services
('Neighborhood Housing Services of Queens', 'Provides affordable housing counseling, homebuyer education, and neighborhood revitalization programs to support stable communities in Queens.', NULL, '/resource-logos/neighborhood-housing-services-logo.jpg', NULL, '94-33 Corona Ave, Elmhurst, NY 11373', '(718) 457-1017', 'resource', ARRAY['Legal Services']::text[]),

('Queens Defenders', 'A public defender organization offering holistic legal services and support to low-income residents facing criminal justice issues.', 'https://queensdefenders.org/', '/resource-logos/queens-defenders-logo.png', 'info@queensdefenders.org', '118-21 Queens Blvd, Forest Hills, NY 11375', '1-844-783-3673', 'resource', ARRAY['Legal Services']::text[]),

-- Youth
('Girl Scouts of Greater New York', 'An organization empowering girls through leadership development, community service, and outdoor experiences.', 'https://www.girlscoutsnyc.org', NULL, 'customercare@girlscoutsnyc.org', 'One Girl Scout Way, New York, NY 10010', '(212) 645-4000', 'resource', ARRAY['Youth']::text[]),

-- Arts
('Jamaica Performing Arts Center (JPAC)', 'A cultural hub in Jamaica, Queens, presenting performing arts shows and providing arts education to the community.', NULL, '/resource-logos/jpac-logo.png', NULL, '153-10 Jamaica Ave Jamaica, NY 11432', '(718) 618-6170', 'resource', ARRAY['Arts']::text[]),

('Jamaica Center for Arts and Learning (JCAL)', 'An arts organization offering exhibitions, arts education, and cultural programs to promote creativity and community engagement.', 'https://jcal.org/', '/resource-logos/jcal-logo.jpg', 'development@jcal.org', '161-04 Jamaica Ave, Jamaica, NY 11432', '(718) 658-7400', 'resource', ARRAY['Arts']::text[]),

('Black Spectrum Theater', 'A community theater company dedicated to producing works that celebrate African American culture and experiences.', 'https://blackspectrum.com', '/resource-logos/black-spectrum-theater-logo.png', 'info@blackspectrum.com', '177-01 Baisley Blvd, Jamaica, NY 11434', '(718) 723-1800', 'resource', ARRAY['Arts']::text[]),

-- Cultural (Community Resources)
('Douglass King Regular Democratic Club', 'A local Democratic political club focused on community activism and political engagement in Southeast Queens.', 'https://www.facebook.com/douglasskingclub/', '/resource-logos/douglass-king-club-logo.jpg', 'douglasskingclub@gmail.com', '204-03 Linden Boulevard, St. Albans, NY 11412', NULL, 'resource', ARRAY['Cultural']::text[]),

('Guy R Brewer Democratic Club', 'A political organization promoting civic participation and Democratic values in the Guy R Brewer area.', NULL, '/resource-logos/guy-r-brewer-club-logo.jpg', 'guyrbrewerdems@gmail.com', NULL, '(718) 809-6350', 'resource', ARRAY['Cultural']::text[]),

('Elner Blackburn Regular Democratic Club', 'A political organization promoting civic participation and Democratic values in the community.', NULL, '/resource-logos/elner-blackburn-club-logo.jpg', 'hon.jacqueboyce@gmail.com', '220-13 Merrick Blvd, Laurelton, NY, United States, New York', '(718) 525-4033', 'resource', ARRAY['Cultural']::text[]),

-- Senior Services
('SNAP Bellerose Center', 'A senior center providing social, recreational, and support services for seniors in the neighborhood.', 'https://snapqueens.org/senior-centers/brookville/', '/resource-logos/snap-logo.jpg', 'info@snapqueens.org', '133-33 Brookville Blvd Suite LL5, Rosedale, NY 11422', '(718) 525-8899', 'resource', ARRAY['Senior Services']::text[]),

('Robert Couch Senior Center', 'A community center providing social, recreational, and support services for seniors in the neighborhood.', 'https://www.rcoac.org/', '/resource-logos/robert-couch-senior-logo.jpg', 'ADMIN@RCOAC.ORG', '13757 Farmers Blvd, New York, NY 11434', '(718) 978-8352', 'resource', ARRAY['Senior Services']::text[]),

('Rochdale Senior Center', 'Offers programs and resources aimed at enhancing the quality of life for older adults in the Rochdale area.', NULL, '/resource-logos/rochdale-senior-logo.jpg', NULL, '169-65 137 Avenue Jamaica, NY 11434', '(718) 525-2800', 'resource', ARRAY['Senior Services']::text[]),

('SNAP Eastern Queens Center', 'Provides workforce development, educational programs, and community services to support economic empowerment.', NULL, '/resource-logos/snap-logo.jpg', 'info@snapqueens.org', '80-45 Winchester Blvd, Queens Village, NY 11427', '(718) 454-2100', 'resource', ARRAY['Senior Services']::text[]),

-- Social
('Rosedale Lions', 'A community service organization focused on health, vision care, and other charitable activities in the Rosedale area.', 'https://rosedalelions.org', '/resource-logos/rosedale-lions-logo.jpg', NULL, '24711 Francis Lewis Blvd, Rosedale, NY 11422', '(917) 983-9676', 'resource', ARRAY['Social']::text[]);