-- Create translation queue table for automatic translations
CREATE TABLE IF NOT EXISTS public.translation_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key TEXT NOT NULL,
  original_text TEXT NOT NULL,
  target_language TEXT NOT NULL,
  page_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Add index for faster queue processing
CREATE INDEX IF NOT EXISTS idx_translation_queue_status ON public.translation_queue(status);
CREATE INDEX IF NOT EXISTS idx_translation_queue_created_at ON public.translation_queue(created_at);

-- Enable RLS
ALTER TABLE public.translation_queue ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to manage queue
CREATE POLICY "Service role can manage translation queue"
  ON public.translation_queue
  FOR ALL
  USING (true);

-- Function to automatically queue translations when new content is added
CREATE OR REPLACE FUNCTION public.queue_translations_for_new_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Only queue if this is a new English source text
  IF NEW.source_language = 'en' AND NEW.target_language = 'en' THEN
    -- Queue translations for Spanish, Haitian Creole, and Hebrew
    INSERT INTO public.translation_queue (content_key, original_text, target_language, page_path)
    VALUES 
      (NEW.content_key, NEW.original_text, 'es', NEW.page_path),
      (NEW.content_key, NEW.original_text, 'ht', NEW.page_path),
      (NEW.content_key, NEW.original_text, 'he', NEW.page_path)
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to automatically queue translations
CREATE TRIGGER trigger_queue_translations
  AFTER INSERT ON public.translations
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_translations_for_new_content();

-- Function to process translation queue (to be called by edge function)
CREATE OR REPLACE FUNCTION public.get_pending_translations(batch_size INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  content_key TEXT,
  original_text TEXT,
  target_language TEXT,
  page_path TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tq.id,
    tq.content_key,
    tq.original_text,
    tq.target_language,
    tq.page_path
  FROM public.translation_queue tq
  WHERE tq.status = 'pending'
  ORDER BY tq.created_at ASC
  LIMIT batch_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;