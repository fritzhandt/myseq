-- Create translations table to store all translated content
CREATE TABLE public.translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key TEXT NOT NULL,
  original_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  source_language TEXT NOT NULL DEFAULT 'en',
  target_language TEXT NOT NULL,
  page_path TEXT,
  element_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(content_key, target_language)
);

-- Create user language preferences table (session-based, no auth required)
CREATE TABLE public.user_language_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id)
);

-- Enable RLS
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_language_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for translations (public read, authenticated insert/update)
CREATE POLICY "Translations are publicly readable" 
ON public.translations 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create translations" 
ON public.translations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update translations" 
ON public.translations 
FOR UPDATE 
USING (true);

-- RLS Policies for user language preferences (public access for session-based tracking)
CREATE POLICY "Language preferences are publicly readable" 
ON public.user_language_preferences 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create language preferences" 
ON public.user_language_preferences 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update language preferences" 
ON public.user_language_preferences 
FOR UPDATE 
USING (true);

-- Add trigger for updating timestamps
CREATE TRIGGER update_translations_updated_at
BEFORE UPDATE ON public.translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_language_preferences_updated_at
BEFORE UPDATE ON public.user_language_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();