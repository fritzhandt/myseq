-- Add latitude and longitude columns to resources table
ALTER TABLE public.resources 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Create index for better query performance
CREATE INDEX idx_resources_coordinates ON public.resources(latitude, longitude);

-- Add comment for documentation
COMMENT ON COLUMN public.resources.latitude IS 'Geocoded latitude from address';
COMMENT ON COLUMN public.resources.longitude IS 'Geocoded longitude from address';