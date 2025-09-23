-- Create job_reports table
CREATE TABLE public.job_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.job_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for job_reports
CREATE POLICY "Anyone can create job reports" 
ON public.job_reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can view job reports" 
ON public.job_reports 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete job reports" 
ON public.job_reports 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_job_reports_updated_at
BEFORE UPDATE ON public.job_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();