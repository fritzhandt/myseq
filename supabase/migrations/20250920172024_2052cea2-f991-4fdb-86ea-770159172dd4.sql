-- Add tags column to events table
ALTER TABLE public.events 
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Create index for better performance on tag searches
CREATE INDEX idx_events_tags ON public.events USING GIN(tags);

-- Create index for title search performance
CREATE INDEX idx_events_title ON public.events USING GIN(to_tsvector('english', title));

-- Create index for description search performance  
CREATE INDEX idx_events_description ON public.events USING GIN(to_tsvector('english', description));