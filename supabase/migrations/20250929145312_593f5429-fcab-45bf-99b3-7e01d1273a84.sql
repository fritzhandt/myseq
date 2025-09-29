-- Insert Youth Programs - Sports
INSERT INTO public.resources (organization_name, description, address, categories, phone, website) VALUES
('United Methodist Church of Floral Park', 'Floral Park Youth Council offers sports, trips, events. Free programs for youth.', '35 Verbena Avenue Floral Park, NY 11001', ARRAY['sports', 'recreational'], NULL, NULL),
('YMCA of Greater New York - Jamaica', 'Physical activity, development, and social programs for youth. Membership fees vary.', '238-10 Hillside Ave., Jamaica, NY 11426', ARRAY['sports', 'wellness'], NULL, NULL),
('Masjid Eesa ibn Maryam', 'Mighty Youth program featuring games, sports, and activities. Registration fee $5.', '90-20 191st Street, Hollis, NY 11423', ARRAY['sports', 'recreational'], NULL, NULL),
('Roy Wilkins Park', 'Free football and swimming programs for youth. Some programs may have fees.', '177th Street & Baisley Boulevard Jamaica, NY 11434', ARRAY['sports', 'recreational'], NULL, NULL),
('Rosedale Jets', 'Youth football program with $25 registration fee.', '144-13 [Address incomplete in source]', ARRAY['sports'], NULL, NULL);

-- Insert Youth Programs - Mental Health
INSERT INTO public.resources (organization_name, description, address, categories, phone, website) VALUES
('Jamaica Family Wellness Center', 'Individual and group counseling services for youth and families. Insurance accepted.', '238-10 Hillside Ave., Jamaica, NY 11426', ARRAY['mental health'], NULL, NULL),
('CAPE Mental Health', 'CAPE Adolescent Program for ages 12-20. Insurance accepted.', '59-28 Little Neck Parkway, Little Neck, NY 11362', ARRAY['mental health'], NULL, NULL),
('Queens Village Committee for Mental Health', 'Adult and child wellness services. Insurance accepted.', '116-30 Sutphin Boulevard Jamaica, NY 11434', ARRAY['mental health'], NULL, NULL);

-- Insert Youth Programs - Educational
INSERT INTO public.resources (organization_name, description, address, categories) VALUES
('Floral Park Public Library', 'Summer Reading Club and educational programs. Free for all participants.', '17 Caroline Pl, Floral Park, NY 11001', ARRAY['educational']),
('Queens Community House', 'Youth development program for ages 5-21. Free programs available.', '108-69 62nd Drive Queens, NY 11375', ARRAY['educational', 'recreational']),
('Scope Education Services', 'K-6th Educational Program in STEM, Fine Arts, & Movement. 3 day ($212.40) - 5 day ($383.99)', '2 Larch Ave, Floral Park, NY 11001', ARRAY['educational']),
('New Deal After School', 'Afterschool program with homework help, games, activities, and arts. Free program.', '188-04 Liberty Ave. St. Albans, NY 11412', ARRAY['educational', 'recreational']),
('Hollis Public Library', 'Public library services and youth programs.', 'Hollis, NY', ARRAY['educational']),
('Cambria Heights Public Library', 'Public library services and community programs.', 'Cambria Heights, NY', ARRAY['educational']),
('St. Albans Public Library', 'Public library services and community programs.', 'St. Albans, NY', ARRAY['educational']);

-- Insert Youth Programs - Arts
INSERT INTO public.resources (organization_name, description, address, categories) VALUES
('Ace Academic and Creative Studio', 'Inclusive Academic Tutoring program, arts for after school, and mural education program.', '219-44 Jamaica Ave Queens Village NY 11429', ARRAY['arts', 'educational']),
('Keiko Studios', 'Music lessons and event space for all ages.', '212-26 Jamaica Ave Queens Village NY 11428', ARRAY['arts']),
('Joes Academy of Music', 'Music and dance instruction for all ages.', '114-04 Farmers Blvd, St. Albans, NY 11412', ARRAY['arts']),
('Queens Public Library Cambria Heights', 'Teen Center with studio and technology room for creative activities.', '218 and Linden, Cambria Heights', ARRAY['arts', 'educational']),
('My First School Experience', 'Parents and children activities in music, movement, and social interaction. 2 Day ($275) - 5 Day ($350)', '35 Verbena Ave Floral Park, NY 11001', ARRAY['arts', 'educational']);

-- Insert Adult Programs - Restaurants (categorized as recreational)
INSERT INTO public.resources (organization_name, description, address, categories) VALUES
('Netties', 'Soul food restaurant serving the Southeast Queens community.', 'Hempstead Ave, Queens Village NY 11429', ARRAY['recreational']),
('Southern Girl', 'Soul food restaurant offering authentic Southern cuisine.', '223-02 Merrick Blvd Queens NY 11413', ARRAY['recreational']),
('Cookerz Blend', 'Caribbean cuisine restaurant serving traditional dishes.', '217-84 Hempstead Ave, Queens NY 11429', ARRAY['recreational']),
('Cove Restaurant', 'Local dining establishment serving the community.', '243-10 Merrick Blvd, Rosedale NY 11422', ARRAY['recreational']),
('Hibiscus Restaurant', 'Community restaurant offering dining services.', '221-13 Jamaica Ave, Queens NY 11428', ARRAY['recreational']),
('Cara Mia', 'Italian restaurant offering authentic Italian cuisine.', '146 Tulip Ave, Floral Park', ARRAY['recreational']),
('32 North', 'Restaurant serving the Valley Stream community.', '32 N Central Ave, Valley Stream NY 11580', ARRAY['recreational']),
('Blue Seafood Restaurant', 'Seafood restaurant specializing in fresh seafood dishes.', '222-02 Merrick Blvd Queens NY 11413', ARRAY['recreational']),
('Caribbean Soul', 'Caribbean cuisine restaurant in Rosedale.', '234-04 Merrick Blvd Rosedale NY 11422', ARRAY['recreational']);

-- Insert Adult Programs - Wellness
INSERT INTO public.resources (organization_name, description, address, categories) VALUES
('I am Yogi Studios', 'Yoga and wellness studio offering various classes and programs.', '219-09 Hempstead Ave Jamaica NY 11429', ARRAY['wellness']),
('The Figure Studio', 'Fitness and wellness studio for health and fitness programs.', '111-49 Lefferts Blvd South Ozone Park', ARRAY['wellness']),
('Eastern Queens Boxing Club', 'Boxing club offering fitness and training programs. Membership fee required.', '219-07 Hempstead Ave Queens Village NY 11429', ARRAY['wellness', 'sports']),
('Lyfe Boxing', 'Boxing and fitness training facility.', '250-66 Jericho Turnpike Floral Park NY 11001', ARRAY['wellness', 'sports']),
('Bella Luna Wellness', 'Comprehensive wellness services and programs.', '94-32 209th ST Queens Village NY 11429', ARRAY['wellness']),
('Angel Spa', 'Spa and wellness services for relaxation and health.', '90-49 Springfield Blvd Suite 202 Jamaica NY 11428', ARRAY['wellness']);

-- Insert Adult Programs - Mental Health
INSERT INTO public.resources (organization_name, description, address, categories) VALUES
('Breaking Barriers Mental Health Counseling PLLC', 'Professional mental health counseling services for adults.', '229-29 Merrick Blvd Suite 320 Laurelton NY 11413', ARRAY['mental health']),
('Well Life Network', 'Mental health and wellness services for the community.', '209-01 Jamaica Ave NY 11429', ARRAY['mental health', 'wellness']),
('Transitional Services for New York (Mieles Respite)', 'Transitional and respite mental health services.', '80-45 Winchester Blvd Queens Village NY 11427', ARRAY['mental health']);

-- Insert Adult Programs - Business Centers
INSERT INTO public.resources (organization_name, description, address, categories) VALUES
('Resort World Career Center', 'Career development and business services near Jamaica Station.', 'Near Jamaica Station on Sutphin Blvd between Archer and 94th Ave.', ARRAY['business']),
('Greater Jamaica Development Corporation', 'Greater Nexus Coworking Space for business development and networking.', '90-04 161 St, Jamaica NY 11432', ARRAY['business']),
('Queens Business Center', 'Business services and support for entrepreneurs and small businesses.', '144-06 94th Ave Jamaica NY 11435', ARRAY['business']),
('NYC Small Business Solutions', 'Government-sponsored small business development and support services.', '90-27 Sutphin Blvd, Jamaica NY 11435', ARRAY['business']),
('Queens Corporate Center', 'Corporate services and business facilities.', '221-10 Jamaica NY 11429', ARRAY['business']);

-- Insert Senior Programs - Wellness
INSERT INTO public.resources (organization_name, description, address, categories) VALUES
('Queens Community House - Senior Programs', 'Various physical activities including yoga, zumba, and tai chi for seniors. Free programs.', 'Queens, NY', ARRAY['wellness']),
('Hillcrest Older Adult Center', 'Social services, educational workshops, and exercise classes for older adults. Free programs.', 'Hillcrest, NY', ARRAY['wellness', 'educational']),
('Alpha Phi Alpha Senior Center', 'Various activities including art, games, and physical fitness for seniors. Free programs.', 'Southeast Queens', ARRAY['wellness', 'recreational']),
('SNAP Brookville Center', 'Meals, medical transportation, and case assistance services for seniors. Free programs.', 'Brookville, NY', ARRAY['wellness']),
('Allen Community Senior Citizen Centers', 'Dance, fitness classes, arts & crafts for senior citizens. Free programs.', 'Southeast Queens', ARRAY['wellness', 'arts']);

-- Insert Senior Programs - Mental Health
INSERT INTO public.resources (organization_name, description, address, categories) VALUES
('Centerlight Healthcare', 'Primary care, restorative therapy, and physical therapy for seniors. Insurance accepted.', 'Southeast Queens', ARRAY['mental health', 'wellness']),
('Hollis Avenue Senior Buddy System', 'Social support and companionship program for seniors. Free program.', 'Hollis, NY', ARRAY['mental health']),
('Golden Years Senior Programs', 'Meditation, yoga, games, and social activities for seniors. Free programs.', 'Southeast Queens', ARRAY['mental health', 'wellness']),
('Floral Park-Bellerose Senior Citizens', 'Discussion groups, ceramics, and craft classes for senior citizens. Free programs.', 'Floral Park-Bellerose, NY', ARRAY['mental health', 'arts']);