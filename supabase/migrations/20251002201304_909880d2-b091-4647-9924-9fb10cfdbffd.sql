-- Add civic organizations from Civic.pdf

-- Cambria Heights Civic Association
INSERT INTO public.civic_organizations (
  name,
  description,
  coverage_area,
  meeting_address,
  meeting_info,
  contact_info,
  organization_type,
  access_code,
  password_hash,
  is_active
) VALUES (
  'Cambria Heights Civic Association',
  'A civic association serving the Cambria Heights community in Queens, dedicated to improving the quality of life for residents through community engagement and advocacy.',
  'Cambria Heights, Queens',
  'Virtual',
  'Every 2nd Tuesday of the month',
  jsonb_build_object('phone', '(718) 525-1243'),
  'civic_organization',
  'CHCA2025',
  '$2a$10$YourGeneratedHashHere123456789012345678901234567890123',
  true
),
-- Queens Village Civic Association
(
  'Queens Village Civic Association',
  'A civic association dedicated to serving the Queens Village community, promoting neighborhood improvement and resident involvement in local issues.',
  'Queens Village, Queens',
  'Bethsaida Spirituality Center at our Lady of Lourdes Church, 92-70 220th Street, Queens Village, NY 11429',
  'Every 3rd Wednesday of the month',
  jsonb_build_object('phone', '(646) 875-4499'),
  'civic_organization',
  'QVCA2025',
  '$2a$10$YourGeneratedHashHere123456789012345678901234567890124',
  true
),
-- Creedmor Civic Association
(
  'Creedmor Civic Association, INC',
  'A civic association serving the Creedmor community, working to enhance the neighborhood and advocate for residents interests.',
  'Creedmor, Queens',
  '88-01 Lyman St, Queens, NY 11427',
  'Every 2nd Monday of the month',
  jsonb_build_object('phone', '(718) 464-3369'),
  'civic_organization',
  'CCA2025',
  '$2a$10$YourGeneratedHashHere123456789012345678901234567890125',
  true
),
-- Bellerose Civic Association
(
  'Bellerose Civic Association',
  'A civic association representing the Bellerose community, focused on neighborhood preservation and community development.',
  'Bellerose, Queens',
  'Holy Trinity Church, 246-55 87th Avenue',
  'First Thursday of the month',
  jsonb_build_object('website', 'https://bccaqueens.org/contact/'),
  'civic_organization',
  'BCA2025',
  '$2a$10$YourGeneratedHashHere123456789012345678901234567890126',
  true
),
-- Rockaway Civic Association
(
  'Rockaway Civic Association',
  'A civic association dedicated to serving the Rockaway Beach community, promoting coastal preservation and quality of life for residents.',
  'Rockaway Beach, Queens',
  'Varies',
  'First Thursday of the Month - 7 PM',
  jsonb_build_object('email', 'info@rockawaybeachcivicassociation.org'),
  'civic_organization',
  'RCA2025',
  '$2a$10$YourGeneratedHashHere123456789012345678901234567890127',
  true
);