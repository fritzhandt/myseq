-- Standardize all phone numbers to (XXX)-XXX-XXXX format
UPDATE public.resources 
SET phone = 
  CASE 
    WHEN phone IS NULL OR phone = '' THEN phone
    ELSE 
      '(' || 
      SUBSTRING(REGEXP_REPLACE(phone, '[^0-9]', '', 'g') FROM 
        CASE 
          WHEN LENGTH(REGEXP_REPLACE(phone, '[^0-9]', '', 'g')) = 11 THEN 2 
          ELSE 1 
        END 
        FOR 3
      ) || 
      ')-' || 
      SUBSTRING(REGEXP_REPLACE(phone, '[^0-9]', '', 'g') FROM 
        CASE 
          WHEN LENGTH(REGEXP_REPLACE(phone, '[^0-9]', '', 'g')) = 11 THEN 5 
          ELSE 4 
        END 
        FOR 3
      ) || 
      '-' || 
      SUBSTRING(REGEXP_REPLACE(phone, '[^0-9]', '', 'g') FROM 
        CASE 
          WHEN LENGTH(REGEXP_REPLACE(phone, '[^0-9]', '', 'g')) = 11 THEN 8 
          ELSE 7 
        END 
        FOR 4
      )
  END,
  updated_at = now()
WHERE phone IS NOT NULL AND phone != '';