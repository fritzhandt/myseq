-- Add SELECT policy for authenticated users to see all civic organizations (including inactive)
CREATE POLICY "Authenticated users can view all civic organizations"
ON civic_organizations
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);