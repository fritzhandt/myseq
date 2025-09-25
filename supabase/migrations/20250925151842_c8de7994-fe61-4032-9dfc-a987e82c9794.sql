-- Phase 1: Create user roles and approval queue system

-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('main_admin', 'sub_admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'sub_admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_roles.user_id = $1 LIMIT 1;
$$;

-- Create function to check if user is main admin
CREATE OR REPLACE FUNCTION public.is_main_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 AND role = 'main_admin'
  );
$$;

-- RLS policies for user_roles
CREATE POLICY "Main admins can view all user roles" 
ON public.user_roles FOR SELECT 
USING (public.is_main_admin(auth.uid()));

CREATE POLICY "Users can view their own role" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Main admins can manage user roles" 
ON public.user_roles FOR ALL 
USING (public.is_main_admin(auth.uid()));

-- Create pending_events table for approval queue
CREATE TABLE public.pending_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME WITHOUT TIME ZONE NOT NULL,
  cover_photo_url TEXT,
  additional_images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  age_group TEXT[] DEFAULT '{}',
  elected_officials TEXT[] DEFAULT '{}',
  registration_link TEXT,
  registration_email TEXT,
  registration_phone TEXT,
  registration_notes TEXT DEFAULT '',
  office_address TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  civic_org_id UUID,
  -- Approval metadata
  submitted_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pending_resources table
CREATE TABLE public.pending_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_name TEXT NOT NULL,
  description TEXT NOT NULL,
  website TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  logo_url TEXT,
  cover_photo_url TEXT,
  categories TEXT[] NOT NULL DEFAULT '{}',
  -- Approval metadata
  submitted_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pending_community_alerts table
CREATE TABLE public.pending_community_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  photos TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- Approval metadata
  submitted_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pending_special_events table
CREATE TABLE public.pending_special_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  -- Approval metadata
  submitted_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all pending tables
ALTER TABLE public.pending_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_community_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_special_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for pending tables
-- Main admins can see everything, sub-admins can only see their own submissions
CREATE POLICY "Main admins can view all pending events" 
ON public.pending_events FOR SELECT 
USING (public.is_main_admin(auth.uid()));

CREATE POLICY "Sub-admins can view their own pending events" 
ON public.pending_events FOR SELECT 
USING (auth.uid() = submitted_by);

CREATE POLICY "Admins can create pending events" 
ON public.pending_events FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Main admins can update pending events" 
ON public.pending_events FOR UPDATE 
USING (public.is_main_admin(auth.uid()));

CREATE POLICY "Sub-admins can update their own pending events" 
ON public.pending_events FOR UPDATE 
USING (auth.uid() = submitted_by AND status = 'pending');

-- Similar policies for pending_resources
CREATE POLICY "Main admins can view all pending resources" 
ON public.pending_resources FOR SELECT 
USING (public.is_main_admin(auth.uid()));

CREATE POLICY "Sub-admins can view their own pending resources" 
ON public.pending_resources FOR SELECT 
USING (auth.uid() = submitted_by);

CREATE POLICY "Admins can create pending resources" 
ON public.pending_resources FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Main admins can update pending resources" 
ON public.pending_resources FOR UPDATE 
USING (public.is_main_admin(auth.uid()));

CREATE POLICY "Sub-admins can update their own pending resources" 
ON public.pending_resources FOR UPDATE 
USING (auth.uid() = submitted_by AND status = 'pending');

-- Similar policies for pending_community_alerts
CREATE POLICY "Main admins can view all pending community alerts" 
ON public.pending_community_alerts FOR SELECT 
USING (public.is_main_admin(auth.uid()));

CREATE POLICY "Sub-admins can view their own pending community alerts" 
ON public.pending_community_alerts FOR SELECT 
USING (auth.uid() = submitted_by);

CREATE POLICY "Admins can create pending community alerts" 
ON public.pending_community_alerts FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Main admins can update pending community alerts" 
ON public.pending_community_alerts FOR UPDATE 
USING (public.is_main_admin(auth.uid()));

CREATE POLICY "Sub-admins can update their own pending community alerts" 
ON public.pending_community_alerts FOR UPDATE 
USING (auth.uid() = submitted_by AND status = 'pending');

-- Similar policies for pending_special_events
CREATE POLICY "Main admins can view all pending special events" 
ON public.pending_special_events FOR SELECT 
USING (public.is_main_admin(auth.uid()));

CREATE POLICY "Sub-admins can view their own pending special events" 
ON public.pending_special_events FOR SELECT 
USING (auth.uid() = submitted_by);

CREATE POLICY "Admins can create pending special events" 
ON public.pending_special_events FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Main admins can update pending special events" 
ON public.pending_special_events FOR UPDATE 
USING (public.is_main_admin(auth.uid()));

CREATE POLICY "Sub-admins can update their own pending special events" 
ON public.pending_special_events FOR UPDATE 
USING (auth.uid() = submitted_by AND status = 'pending');

-- Add updated_at triggers for all new tables
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pending_events_updated_at
  BEFORE UPDATE ON public.pending_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pending_resources_updated_at
  BEFORE UPDATE ON public.pending_resources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pending_community_alerts_updated_at
  BEFORE UPDATE ON public.pending_community_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pending_special_events_updated_at
  BEFORE UPDATE ON public.pending_special_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();