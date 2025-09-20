-- Change age_group column from text to text array to support multiple age groups
ALTER TABLE public.events 
ALTER COLUMN age_group TYPE text[] USING ARRAY[age_group];