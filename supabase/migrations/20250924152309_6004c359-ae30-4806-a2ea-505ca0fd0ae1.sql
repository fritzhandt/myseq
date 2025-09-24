-- Create table to store PDF content that the AI can reference
CREATE TABLE public.pdf_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  content TEXT NOT NULL,
  hyperlinks JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pdf_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can create PDF content" 
ON public.pdf_content 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update PDF content" 
ON public.pdf_content 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete PDF content" 
ON public.pdf_content 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "PDF content is publicly viewable" 
ON public.pdf_content 
FOR SELECT 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_pdf_content_updated_at
BEFORE UPDATE ON public.pdf_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();