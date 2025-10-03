-- Create pending modification tables for tracking sub-admin change requests

-- Pending resource modifications table
CREATE TABLE public.pending_resource_modifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('edit', 'delete')),
  modified_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_by UUID NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pending job modifications table
CREATE TABLE public.pending_job_modifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('edit', 'delete')),
  modified_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_by UUID NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pending civic organization modifications table
CREATE TABLE public.pending_civic_modifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  civic_org_id UUID NOT NULL REFERENCES public.civic_organizations(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('edit', 'delete', 'deactivate', 'password_change')),
  modified_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_by UUID NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all pending modification tables
ALTER TABLE public.pending_resource_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_job_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_civic_modifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pending_resource_modifications
CREATE POLICY "Sub-admins can create resource modification requests"
  ON public.pending_resource_modifications
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Sub-admins can view their own resource modification requests"
  ON public.pending_resource_modifications
  FOR SELECT
  USING (auth.uid() = submitted_by);

CREATE POLICY "Main admins can view all resource modification requests"
  ON public.pending_resource_modifications
  FOR SELECT
  USING (is_main_admin(auth.uid()));

CREATE POLICY "Main admins can update resource modification requests"
  ON public.pending_resource_modifications
  FOR UPDATE
  USING (is_main_admin(auth.uid()));

-- RLS Policies for pending_job_modifications
CREATE POLICY "Sub-admins can create job modification requests"
  ON public.pending_job_modifications
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Sub-admins can view their own job modification requests"
  ON public.pending_job_modifications
  FOR SELECT
  USING (auth.uid() = submitted_by);

CREATE POLICY "Main admins can view all job modification requests"
  ON public.pending_job_modifications
  FOR SELECT
  USING (is_main_admin(auth.uid()));

CREATE POLICY "Main admins can update job modification requests"
  ON public.pending_job_modifications
  FOR UPDATE
  USING (is_main_admin(auth.uid()));

-- RLS Policies for pending_civic_modifications
CREATE POLICY "Sub-admins can create civic modification requests"
  ON public.pending_civic_modifications
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Sub-admins can view their own civic modification requests"
  ON public.pending_civic_modifications
  FOR SELECT
  USING (auth.uid() = submitted_by);

CREATE POLICY "Main admins can view all civic modification requests"
  ON public.pending_civic_modifications
  FOR SELECT
  USING (is_main_admin(auth.uid()));

CREATE POLICY "Main admins can update civic modification requests"
  ON public.pending_civic_modifications
  FOR UPDATE
  USING (is_main_admin(auth.uid()));

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_pending_resource_modifications_updated_at
  BEFORE UPDATE ON public.pending_resource_modifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pending_job_modifications_updated_at
  BEFORE UPDATE ON public.pending_job_modifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pending_civic_modifications_updated_at
  BEFORE UPDATE ON public.pending_civic_modifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();