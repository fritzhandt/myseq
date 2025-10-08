-- Add column to track organizations that need password reset
ALTER TABLE civic_organizations 
ADD COLUMN IF NOT EXISTS password_needs_reset boolean DEFAULT false;

-- Mark all existing organizations with bcrypt passwords for reset
UPDATE civic_organizations 
SET password_needs_reset = true 
WHERE password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%';

-- Add comment for documentation
COMMENT ON COLUMN civic_organizations.password_needs_reset IS 'Indicates if organization password needs to be migrated from bcrypt to PBKDF2 format';