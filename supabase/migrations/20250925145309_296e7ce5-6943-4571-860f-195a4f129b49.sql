-- Create table to track daily AI search usage
CREATE TABLE public.ai_search_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_date DATE NOT NULL DEFAULT CURRENT_DATE,
  search_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on search_date to prevent duplicates
CREATE UNIQUE INDEX idx_ai_search_usage_date ON public.ai_search_usage(search_date);

-- Enable RLS
ALTER TABLE public.ai_search_usage ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access for checking limits
CREATE POLICY "AI search usage is publicly readable" 
ON public.ai_search_usage 
FOR SELECT 
USING (true);

-- Create policy for authenticated users to update usage (for the edge function)
CREATE POLICY "Authenticated users can manage AI search usage" 
ON public.ai_search_usage 
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_search_usage_updated_at
BEFORE UPDATE ON public.ai_search_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();