import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Mail, Shield, UserPlus } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface AdminUser {
  id: string;
  email: string;
  role: 'main_admin' | 'sub_admin';
  created_at: string;
}

export const AdminUsersList = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'main_admin' | 'sub_admin'>('sub_admin');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) throw usersError;
      
      const users = usersData?.users || [];

      const adminUsers: AdminUser[] = roles?.map(role => {
        const user = users?.find(u => u.id === role.user_id);
        return {
          id: role.user_id,
          email: user?.email || 'Unknown',
          role: role.role as 'main_admin' | 'sub_admin',
          created_at: role.created_at
        };
      }) || [];

      setAdmins(adminUsers);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch admin users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteAdmin = async () => {
    if (!newAdminEmail || !newAdminEmail.includes('@')) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (inviting) return; // Prevent multiple rapid clicks

    setInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke('invite-admin', {
        body: {
          email: newAdminEmail,
          role: newAdminRole
        }
      });

      if (error) {
        // Handle rate limit errors specifically
        if (error.message?.includes('rate limit') || error.message?.includes('only request this after')) {
          throw new Error('⏱️ Please wait at least 60 seconds between sending invites (Supabase security rate limit)');
        }
        throw error;
      }

      toast({
        title: "Success",
        description: `Admin invite sent to ${newAdminEmail}`,
      });

      setNewAdminEmail('');
      setNewAdminRole('sub_admin');
      fetchAdmins();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to invite admin",
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;

    try {
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', adminToDelete.id);

      if (roleError) throw roleError;

      const { error: deleteError } = await supabase.auth.admin.deleteUser(adminToDelete.id);
      
      if (deleteError) throw deleteError;

      toast({
        title: "Success",
        description: "Admin user deleted successfully",
      });

      fetchAdmins();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete admin",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setAdminToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite New Admin
          </CardTitle>
          <CardDescription>
            Send an invitation to create a new admin account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newAdminRole} onValueChange={(value: 'main_admin' | 'sub_admin') => setNewAdminRole(value)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sub_admin">Sub Admin</SelectItem>
                  <SelectItem value="main_admin">Main Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleInviteAdmin} disabled={inviting}>
            <Mail className="h-4 w-4 mr-2" />
            {inviting ? 'Sending...' : 'Send Invite'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Users
          </CardTitle>
          <CardDescription>
            Manage existing admin accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {admins.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No admin users found</p>
            ) : (
              admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{admin.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Role: {admin.role === 'main_admin' ? 'Main Admin' : 'Sub Admin'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(admin.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setAdminToDelete(admin);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Admin User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {adminToDelete?.email}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAdmin}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
