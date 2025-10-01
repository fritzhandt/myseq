-- Add delete policy for civic organizations
CREATE POLICY "Authenticated users can delete civic organizations"
ON civic_organizations
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);