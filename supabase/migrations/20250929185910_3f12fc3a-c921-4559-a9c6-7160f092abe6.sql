-- Update the trigger function to include Hindi (hi) in the translation queue
CREATE OR REPLACE FUNCTION public.queue_translations_for_new_content()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only queue if this is a new English source text
  IF NEW.source_language = 'en' AND NEW.target_language = 'en' THEN
    -- Queue translations for Spanish, Haitian Creole, Hebrew, and Hindi
    INSERT INTO public.translation_queue (content_key, original_text, target_language, page_path)
    VALUES 
      (NEW.content_key, NEW.original_text, 'es', NEW.page_path),
      (NEW.content_key, NEW.original_text, 'ht', NEW.page_path),
      (NEW.content_key, NEW.original_text, 'he', NEW.page_path),
      (NEW.content_key, NEW.original_text, 'hi', NEW.page_path)
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;