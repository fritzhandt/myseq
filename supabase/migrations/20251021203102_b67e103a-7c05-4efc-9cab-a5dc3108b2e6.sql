-- Make submitted_by nullable to allow anonymous public submissions
ALTER TABLE pending_resources 
ALTER COLUMN submitted_by DROP NOT NULL;