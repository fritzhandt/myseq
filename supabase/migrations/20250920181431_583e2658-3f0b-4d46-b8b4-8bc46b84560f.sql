-- Create special_events table
CREATE TABLE public.special_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('single_day', 'multi_day')),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create special_event_days table for multi-day events
CREATE TABLE public.special_event_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  special_event_id UUID NOT NULL REFERENCES public.special_events(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create special_event_assignments table
CREATE TABLE public.special_event_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  special_event_id UUID NOT NULL REFERENCES public.special_events(id) ON DELETE CASCADE,
  special_event_day_id UUID REFERENCES public.special_event_days(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(special_event_id, special_event_day_id, event_id)
);

-- Enable RLS on all tables
ALTER TABLE public.special_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_event_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_event_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for special_events
CREATE POLICY "Special events are viewable by everyone" 
ON public.special_events 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create special events" 
ON public.special_events 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update special events" 
ON public.special_events 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete special events" 
ON public.special_events 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- RLS policies for special_event_days
CREATE POLICY "Special event days are viewable by everyone" 
ON public.special_event_days 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create special event days" 
ON public.special_event_days 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update special event days" 
ON public.special_event_days 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete special event days" 
ON public.special_event_days 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- RLS policies for special_event_assignments
CREATE POLICY "Special event assignments are viewable by everyone" 
ON public.special_event_assignments 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create special event assignments" 
ON public.special_event_assignments 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update special event assignments" 
ON public.special_event_assignments 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete special event assignments" 
ON public.special_event_assignments 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Add triggers for updated_at columns
CREATE TRIGGER update_special_events_updated_at
BEFORE UPDATE ON public.special_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_special_event_days_updated_at
BEFORE UPDATE ON public.special_event_days
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add constraint to ensure only one active special event at a time
CREATE UNIQUE INDEX unique_active_special_event ON public.special_events (is_active) WHERE is_active = true;