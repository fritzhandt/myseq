-- Add document_type column to pdf_content table to support multiple document types
ALTER TABLE public.pdf_content 
ADD COLUMN document_type TEXT DEFAULT 'general';

-- Add index for better performance when querying by document type
CREATE INDEX idx_pdf_content_document_type ON public.pdf_content(document_type);

-- Update existing records to have 'general' type
UPDATE public.pdf_content 
SET document_type = 'general' 
WHERE document_type IS NULL;