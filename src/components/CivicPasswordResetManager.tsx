import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Key, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CivicOrg {
  id: string;
  name: string;
  access_code: string;
  password_needs_reset: boolean;
}

export const CivicPasswordResetManager = () => {
  const [organizations, setOrganizations] = useState<CivicOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState<string | null>(null);
  const [newPasswords, setNewPasswords] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('civic_organizations')
        .select('id, name, access_code, password_needs_reset')
        .order('name');

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: "Error",
        description: "Failed to load organizations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (orgId: string, orgName: string) => {
    const newPassword = newPasswords[orgId];
    
    if (!newPassword || newPassword.length < 8) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setResetting(orgId);

    try {
      const response = await fetch(
        'https://qdqmhgwjupsoradhktzu.supabase.co/functions/v1/civic-password-reset',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcW1oZ3dqdXBzb3JhZGhrdHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzODY5NzQsImV4cCI6MjA3Mzk2Mjk3NH0.90wVzi9LjnGUlBtCEBw6XHKJkf2DY1e_nVq7sP0L_8o',
          },
          body: JSON.stringify({
            org_id: orgId,
            new_password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to reset password');
      }

      toast({
        title: "Success",
        description: `Password reset for ${orgName}`,
      });

      // Clear the password field and refresh the list
      setNewPasswords(prev => {
        const updated = { ...prev };
        delete updated[orgId];
        return updated;
      });
      
      fetchOrganizations();
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setResetting(null);
    }
  };

  const needsResetCount = organizations.filter(org => org.password_needs_reset).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Civic Organization Password Management
        </CardTitle>
        <CardDescription>
          Reset passwords for civic organizations. Passwords will be updated to the new secure format (PBKDF2).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {needsResetCount > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {needsResetCount} organization{needsResetCount > 1 ? 's' : ''} {needsResetCount > 1 ? 'have' : 'has'} legacy password format and need{needsResetCount === 1 ? 's' : ''} to be reset.
            </AlertDescription>
          </Alert>
        )}

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Access Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>New Password</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell className="font-mono text-sm">{org.access_code}</TableCell>
                  <TableCell>
                    {org.password_needs_reset ? (
                      <Badge variant="destructive">Needs Reset</Badge>
                    ) : (
                      <Badge variant="secondary">Up to Date</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="password"
                      placeholder="Enter new password (min 8 chars)"
                      value={newPasswords[org.id] || ''}
                      onChange={(e) => setNewPasswords(prev => ({
                        ...prev,
                        [org.id]: e.target.value
                      }))}
                      className="max-w-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handlePasswordReset(org.id, org.name)}
                      disabled={resetting === org.id || !newPasswords[org.id]}
                      size="sm"
                    >
                      {resetting === org.id ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Alert>
          <AlertDescription className="text-sm">
            <strong>Note:</strong> After resetting a password, provide the new credentials to the organization administrator securely. 
            The password will be hashed using PBKDF2 with 100,000 iterations.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
