-- Expand short and vague program descriptions to be more in-depth and informative

UPDATE resources 
SET description = CASE id
  WHEN 'a746aedf-d9ad-4408-a609-450817a8f9c8' THEN 'Authentic Caribbean food restaurant offering traditional island flavors, signature dishes, and a warm dining atmosphere. Experience the rich culinary heritage of the Caribbean with fresh ingredients and family recipes passed down through generations.'
  WHEN '72c57d87-8f1b-43f5-ba09-804dbfbbfd17' THEN 'Southern Girl Soul Food serves traditional Southern comfort food featuring homestyle classics like fried chicken, collard greens, mac and cheese, and cornbread. A family-friendly establishment bringing authentic soul food traditions to the community.'
  WHEN '37080d5a-69c4-4843-b11b-25bda70c0f2c' THEN 'Lyfe Boxing provides professional boxing training and comprehensive fitness programs for all skill levels. Features include personal training, group classes, cardio conditioning, and strength training in a supportive community environment.'
  WHEN 'c20990e7-d940-461e-9aa3-ddabbc8493ef' THEN 'Caribbean Soul brings the vibrant flavors of Caribbean cuisine to Rosedale, offering jerk chicken, curry goat, oxtail, rice and peas, and traditional island specialties. Dine-in and takeout available with generous portions and authentic seasonings.'
  WHEN 'd9543f12-5e55-4181-a378-df7b04cd5384' THEN 'Queens Corporate Center offers professional office space, meeting rooms, and business support services. Provides modern facilities for corporations, startups, and entrepreneurs including conference rooms, administrative support, and networking opportunities.'
  WHEN '49459e95-98f7-46f4-a4a2-1fe2ef80bb30' THEN 'I am Yogi Studios is the first Black-owned hot yoga studio in Queens, offering heated yoga classes, meditation sessions, and wellness workshops. Welcoming space for practitioners of all levels focusing on mindfulness, flexibility, and community building.'
  WHEN 'cd52ff64-3089-4c43-a54e-7c007947d5dd' THEN 'Bella Luna Wellness provides holistic health services including massage therapy, nutrition counseling, stress management programs, and wellness coaching. Personalized care plans designed to support physical, mental, and emotional well-being.'
  WHEN 'f9ab8bd7-730c-4f77-818e-9ffe5695f275' THEN 'Hibiscus Restaurant serves a diverse menu featuring American and international cuisine in a welcoming community atmosphere. Family-friendly dining with daily specials, catering services, and a commitment to quality ingredients and service.'
  WHEN '5cdb9688-65ab-4641-9bb7-3ad08bab0790' THEN '32 North is a popular Valley Stream restaurant offering contemporary American cuisine with creative twists. Known for their craft cocktails, weekend brunch, and seasonal menu featuring locally sourced ingredients whenever possible.'
  WHEN '1dff290d-fe59-4f2e-a215-86544a73944f' THEN 'Queens Public Library - St. Albans provides free access to books, digital resources, computer labs, and educational programs for all ages. Community hub offering homework help, adult literacy classes, cultural events, and technology training.'
  WHEN '9fe5036a-5775-490f-b171-51dee2879106' THEN 'Sigma Gamma Rho Queens Alumni chapter is a service organization dedicated to community uplift through scholarship programs, youth mentorship, health initiatives, and civic engagement. Committed to serving the Greater Queens community through sisterhood and service.'
  WHEN '05d14738-05dd-4c4f-8555-8756a61b91b6' THEN 'Transitional Services for New York (Mieles Respite) offers short-term mental health respite care, crisis intervention, and transitional housing support. Provides a safe, therapeutic environment with professional counseling and community reintegration services.'
  WHEN '562a7368-47be-41b0-ada9-fcc3f80ad788' THEN 'Cove Restaurant offers casual dining with a diverse menu of American favorites, seafood specialties, and daily specials. Community gathering spot known for friendly service, generous portions, and affordable prices for families and groups.'
  WHEN 'e0e64d10-2cf7-4030-89eb-9acc2224748f' THEN 'Angel Spa provides professional spa and wellness services including therapeutic massage, facials, body treatments, and relaxation therapies. Tranquil environment designed to reduce stress, promote healing, and restore balance to mind and body.'
  WHEN '304f1c9e-b90d-410b-9348-30a8e44b4e83' THEN 'Cara Mia serves authentic Italian cuisine featuring homemade pasta, wood-fired pizzas, and traditional recipes from various Italian regions. Family-owned restaurant creating an intimate dining experience with fresh ingredients and Old World charm.'
  WHEN 'd14eb736-ce4d-49c1-bd2e-0ccacd2c0381' THEN 'Well Life Network delivers comprehensive mental health and wellness services including individual therapy, group counseling, psychiatric support, and care management. Culturally responsive care helping community members achieve emotional wellness and recovery.'
  WHEN '7c493953-7df6-4fda-89ed-5eba6c265598' THEN 'Blue Seafood Restaurant specializes in fresh seafood including fish, shrimp, crab, and lobster prepared in various styles. Daily catches, seafood platters, and Southern-inspired preparations served in a casual, family-friendly atmosphere.'
  WHEN '13ffee12-5db8-450d-940c-afe5132c2463' THEN 'Breaking Barriers Mental Health Counseling PLLC provides professional licensed therapy for adults dealing with anxiety, depression, trauma, and life transitions. Evidence-based treatment approaches in a confidential, supportive environment focused on personal growth and healing.'
  WHEN '8d89ac5e-f17b-491f-a880-18e58f439846' THEN 'The Figure Studio offers specialized fitness programs including strength training, cardio classes, nutrition guidance, and personalized workout plans. State-of-the-art equipment and certified trainers help members achieve their health and fitness goals in a motivating environment.'
  WHEN '31e3c117-0da9-46b3-ad71-6ca603e8ff9a' THEN 'Rosedale Jets provides youth football and cheerleading programs for children ages 5-14 in Rosedale, Queens. Emphasis on teamwork, discipline, physical fitness, and character development through organized sports and community participation.'
  WHEN 'a0dd5672-cdd5-40fc-b62e-0baf352c54d7' THEN 'Resort World Career Center provides job placement services, career counseling, skills training, and employment resources near Jamaica Station. Free services connecting job seekers with employers while offering resume assistance and interview preparation.'
  WHEN '8a265558-c94e-4fa9-838e-dc3874cc11fb' THEN 'Jamaica 311 is A Better Jamaica''s community reporting platform allowing residents to report neighborhood issues, request services, and stay informed about local updates. Digital tool empowering community members to improve their neighborhood through civic engagement.'
  WHEN '880427f8-459b-4674-ae22-b724a42e43ad' THEN 'Bellerose Business Improvement District promotes economic growth and community development in Bellerose Village through merchant support, beautification projects, events, and marketing initiatives. Partnership of local businesses and community stakeholders enhancing the neighborhood.'
  WHEN '1dd8ee03-e519-4fe7-9089-b73683b66cd9' THEN 'Hollis Avenue Senior Buddy System is a free program connecting seniors with friendly visitors for companionship, conversation, and social support. Combats isolation while providing emotional support and community connections for older adults aging in place.'
  WHEN '85d9e78b-49c5-4f28-a7b4-8c72afca7f7b' THEN 'Queens Public Library - Cambria Heights features a dedicated Teen Center with recording studio, technology lab, and creative spaces. Offers STEM programs, college prep resources, multimedia production equipment, and youth development activities for ages 13-18.'
  WHEN '6c2ca824-3cba-4bdd-9cb9-48d280189763' THEN 'NYC Small Business Solutions provides government-sponsored support including free business courses, one-on-one counseling, financing assistance, and regulatory guidance. Helps entrepreneurs start, operate, and grow businesses through workshops and expert resources.'
  ELSE description
END,
updated_at = now()
WHERE id IN (
  'a746aedf-d9ad-4408-a609-450817a8f9c8', '72c57d87-8f1b-43f5-ba09-804dbfbbfd17',
  '37080d5a-69c4-4843-b11b-25bda70c0f2c', 'c20990e7-d940-461e-9aa3-ddabbc8493ef',
  'd9543f12-5e55-4181-a378-df7b04cd5384', '49459e95-98f7-46f4-a4a2-1fe2ef80bb30',
  'cd52ff64-3089-4c43-a54e-7c007947d5dd', 'f9ab8bd7-730c-4f77-818e-9ffe5695f275',
  '5cdb9688-65ab-4641-9bb7-3ad08bab0790', '1dff290d-fe59-4f2e-a215-86544a73944f',
  '9fe5036a-5775-490f-b171-51dee2879106', '05d14738-05dd-4c4f-8555-8756a61b91b6',
  '562a7368-47be-41b0-ada9-fcc3f80ad788', 'e0e64d10-2cf7-4030-89eb-9acc2224748f',
  '304f1c9e-b90d-410b-9348-30a8e44b4e83', 'd14eb736-ce4d-49c1-bd2e-0ccacd2c0381',
  '7c493953-7df6-4fda-89ed-5eba6c265598', '13ffee12-5db8-450d-940c-afe5132c2463',
  '8d89ac5e-f17b-491f-a880-18e58f439846', '31e3c117-0da9-46b3-ad71-6ca603e8ff9a',
  'a0dd5672-cdd5-40fc-b62e-0baf352c54d7', '8a265558-c94e-4fa9-838e-dc3874cc11fb',
  '880427f8-459b-4674-ae22-b724a42e43ad', '1dd8ee03-e519-4fe7-9089-b73683b66cd9',
  '85d9e78b-49c5-4f28-a7b4-8c72afca7f7b', '6c2ca824-3cba-4bdd-9cb9-48d280189763'
);