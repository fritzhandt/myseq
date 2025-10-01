-- Drop the existing update policy
DROP POLICY IF EXISTS "Authenticated users can update civic organizations" ON civic_organizations;

-- Recreate the update policy with WITH CHECK clause
CREATE POLICY "Authenticated users can update civic organizations"
ON civic_organizations
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);