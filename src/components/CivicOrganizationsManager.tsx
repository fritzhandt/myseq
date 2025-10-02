import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Eye, EyeOff, Copy, Trash2, Users, Building2, RotateCcw, AlertTriangle, Pencil, Download, Shield } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import bcrypt from 'bcryptjs';
import CivicOrgCSVUpload from './CivicOrgCSVUpload';

interface CivicOrganization {
  id: string;
  name: string;
  description: string;
  access_code: string;
  coverage_area: string;
  meeting_info?: string;
  meeting_address?: string;
  contact_info: any;
  is_active: boolean;
  created_at: string;
  organization_type: string;
}

export default function CivicOrganizationsManager() {
  const [organizations, setOrganizations] = useState<CivicOrganization[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [creatingOrgType, setCreatingOrgType] = useState<string>('civic_organization');
  const [editingOrg, setEditingOrg] = useState<CivicOrganization | null>(null);
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(true);
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{isOpen: boolean, orgId?: string, orgName?: string, newPassword?: string}>({isOpen: false});
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean, orgId?: string, orgName?: string}>({isOpen: false});
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    access_code: '',
    password: '',
    coverage_area: '',
    meeting_info: '',
    meeting_address: '',
    email: '',
    phone: '',
    website: '',
    is_active: true,
    organization_type: 'civic_organization'
  });

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('civic_organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch civic organizations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const generateAccessCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, access_code: result }));
  };

  const generatePassword = () => {
    const words = [
      'apple', 'beach', 'chair', 'dance', 'eagle', 'flame', 'grape', 'house',
      'island', 'jungle', 'kite', 'lemon', 'magic', 'ocean', 'piano', 'quiet',
      'river', 'storm', 'tower', 'urban', 'voice', 'water', 'xerus', 'young', 'zebra',
      'bridge', 'castle', 'dragon', 'forest', 'garden', 'happy', 'knight', 'light',
      'mountain', 'night', 'orange', 'purple', 'queen', 'royal', 'silver', 'tiger'
    ];
    
    const getRandomWord = () => words[Math.floor(Math.random() * words.length)];
    const getRandomNumber = () => Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const result = `${getRandomWord()}-${getRandomNumber()}-${getRandomWord()}-${getRandomNumber()}`;
    setFormData(prev => ({ ...prev, password: result }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.access_code || !formData.coverage_area) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const contact_info = {
        email: formData.email || null,
        phone: formData.phone || null,
        website: formData.website || null
      };

      if (editingOrg) {
        // Update existing organization
        const updateData: any = {
          name: formData.name,
          description: formData.description,
          access_code: formData.access_code,
          coverage_area: formData.coverage_area,
          meeting_info: formData.meeting_info || null,
          meeting_address: formData.meeting_address || null,
          contact_info,
          is_active: formData.is_active,
          organization_type: formData.organization_type
        };

        // Only hash and update password if a new one was provided
        if (formData.password) {
          const saltRounds = 12;
          updateData.password_hash = await bcrypt.hash(formData.password, saltRounds);
        }

        const { error } = await supabase
          .from('civic_organizations')
          .update(updateData)
          .eq('id', editingOrg.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Civic organization updated successfully!",
        });
      } else {
        // Create new organization
        if (!formData.password) {
          toast({
            title: "Error",
            description: "Password is required for new organizations",
            variant: "destructive",
          });
          return;
        }

        const saltRounds = 12;
        const password_hash = await bcrypt.hash(formData.password, saltRounds);

        const { error } = await supabase
          .from('civic_organizations')
          .insert([{
            name: formData.name,
            description: formData.description,
            access_code: formData.access_code,
            password_hash,
            coverage_area: formData.coverage_area,
            meeting_info: formData.meeting_info || null,
            meeting_address: formData.meeting_address || null,
            contact_info,
            is_active: formData.is_active,
            organization_type: formData.organization_type
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Civic organization created successfully!",
        });
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        access_code: '',
        password: '',
        coverage_area: '',
        meeting_info: '',
        meeting_address: '',
        email: '',
        phone: '',
        website: '',
        is_active: true,
        organization_type: 'civic_organization'
      });
      setIsCreating(false);
      setEditingOrg(null);
      fetchOrganizations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (org: CivicOrganization) => {
    setFormData({
      name: org.name,
      description: org.description,
      access_code: org.access_code,
      password: '', // Don't populate password for security
      coverage_area: org.coverage_area,
      meeting_info: org.meeting_info || '',
      meeting_address: org.meeting_address || '',
      email: org.contact_info?.email || '',
      phone: org.contact_info?.phone || '',
      website: org.contact_info?.website || '',
      is_active: org.is_active,
      organization_type: org.organization_type
    });
    setEditingOrg(org);
    setCreatingOrgType(org.organization_type);
    setIsCreating(true);
  };

  const exportAccessCodes = () => {
    if (organizations.length === 0) {
      toast({
        title: "No organizations to export",
        description: "Create organizations first",
        variant: "destructive"
      });
      return;
    }

    // Create CSV content with organization names and access codes
    const csvHeader = 'Organization Name,Access Code,Coverage Area,Admin URL\n';
    const csvRows = organizations.map(org => 
      `"${org.name}","${org.access_code}","${org.coverage_area}","${window.location.origin}/civic-auth?code=${org.access_code}"`
    ).join('\n');
    const csvContent = csvHeader + csvRows;

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `civic_organizations_access_codes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Access codes exported",
      description: "CSV file has been downloaded. Note: Passwords are not included for security reasons."
    });
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('civic_organizations')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Organization ${!currentStatus ? 'activated' : 'deactivated'}`,
      });
      
      fetchOrganizations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${type} copied to clipboard!`,
    });
  };

  const resetPassword = async (orgId: string, orgName: string) => {
    try {
      // Generate new password
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let newPassword = '';
      for (let i = 0; i < 12; i++) {
        newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Hash the new password
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(newPassword, saltRounds);

      // Update in database
      const { error } = await supabase
        .from('civic_organizations')
        .update({ password_hash })
        .eq('id', orgId);

      if (error) throw error;

      // Show success dialog with new password
      setResetPasswordDialog({
        isOpen: true,
        orgId,
        orgName,
        newPassword
      });

      toast({
        title: "Password Reset",
        description: `New password generated for ${orgName}`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    }
  };

  const togglePasswordVisibility = (orgId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [orgId]: !prev[orgId]
    }));
  };

  const handleDelete = async () => {
    if (!deleteDialog.orgId) return;

    try {
      const { error } = await supabase
        .from('civic_organizations')
        .delete()
        .eq('id', deleteDialog.orgId);

      if (error) throw error;

      toast({
        title: "Organization Deleted",
        description: `${deleteDialog.orgName} has been permanently deleted`,
      });

      setDeleteDialog({ isOpen: false });
      fetchOrganizations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete organization",
        variant: "destructive",
      });
    }
  };

  const handleCreateNew = (orgType: string) => {
    setCreatingOrgType(orgType);
    setFormData({
      name: '',
      description: '',
      access_code: '',
      password: '',
      coverage_area: '',
      meeting_info: '',
      meeting_address: '',
      email: '',
      phone: '',
      website: '',
      is_active: true,
      organization_type: orgType
    });
    setEditingOrg(null);
    setIsCreating(true);
  };

  if (loading && organizations.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading civic organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Civic Organizations Management
          </h2>
          <p className="text-muted-foreground mt-2">
            Manage civic organizations, community boards, and police councils.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={exportAccessCodes} variant="outline" size="lg">
            <Download className="h-5 w-5 mr-2" />
            Export Access Codes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="civic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="civic" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Civic Organizations
          </TabsTrigger>
          <TabsTrigger value="community-boards" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Community Boards
          </TabsTrigger>
          <TabsTrigger value="police-councils" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Police Councils
          </TabsTrigger>
        </TabsList>

        <TabsContent value="civic" className="space-y-6 mt-6">
          <div className="flex justify-end">
            <Button size="lg" onClick={() => handleCreateNew('civic_organization')}>
              <Plus className="h-5 w-5 mr-2" />
              Create Organization
            </Button>
          </div>

          <Dialog open={isCreating} onOpenChange={(open) => {
              setIsCreating(open);
              if (!open) {
                setEditingOrg(null);
                setFormData({
                  name: '',
                  description: '',
                  access_code: '',
                  password: '',
                  coverage_area: '',
                  meeting_info: '',
                  meeting_address: '',
                  email: '',
                  phone: '',
                  website: '',
                  is_active: true,
                  organization_type: 'civic_organization'
                });
              }
            }}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingOrg ? 'Edit' : 'Create New'} {
                    creatingOrgType === 'community_board' ? 'Community Board' :
                    creatingOrgType === 'police_council' ? 'Police Council' :
                    'Civic Organization'
                  }
                </DialogTitle>
              </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Rosedale Civic Association"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="coverage_area">Coverage Area *</Label>
                  <Input
                    id="coverage_area"
                    value={formData.coverage_area}
                    onChange={(e) => setFormData(prev => ({ ...prev, coverage_area: e.target.value }))}
                    placeholder="e.g., Rosedale, Queens"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the organization"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="access_code">Access Code *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="access_code"
                      value={formData.access_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, access_code: e.target.value.toUpperCase() }))}
                      placeholder="ACCESS CODE"
                      required
                    />
                    <Button type="button" onClick={generateAccessCode} variant="outline">
                      Generate
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password {editingOrg ? '(leave blank to keep current)' : '*'}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      type="text"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder={editingOrg ? "Leave blank to keep current password" : "Password"}
                      required={!editingOrg}
                    />
                    <Button type="button" onClick={generatePassword} variant="outline">
                      Generate
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meeting_info">Meeting Schedule</Label>
                  <Input
                    id="meeting_info"
                    value={formData.meeting_info}
                    onChange={(e) => setFormData(prev => ({ ...prev, meeting_info: e.target.value }))}
                    placeholder="e.g., 3rd Tuesday of each month, 7:00 PM"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="meeting_address">Meeting Address</Label>
                  <Input
                    id="meeting_address"
                    value={formData.meeting_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, meeting_address: e.target.value }))}
                    placeholder="Meeting location address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contact@organization.org"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(718) 555-0123"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://organization.org"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreating(false);
                  setEditingOrg(null);
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (editingOrg ? "Updating..." : "Creating...") : (editingOrg ? "Update Organization" : "Create Organization")}
                </Button>
              </div>
            </form>
            </DialogContent>
          </Dialog>

          <CivicOrgCSVUpload onUploadComplete={fetchOrganizations} />

          <div className="grid gap-4">
            {organizations.filter(org => org.organization_type === 'civic_organization').length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No civic organizations yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first civic organization or upload via CSV.
                  </p>
                  <Button onClick={() => handleCreateNew('civic_organization')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Organization
                  </Button>
                </CardContent>
              </Card>
            ) : (
              organizations.filter(org => org.organization_type === 'civic_organization').map((org) => (
            <Card key={org.id} className={org.is_active ? "" : "opacity-60"}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {org.name}
                      {!org.is_active && <Badge variant="secondary">Inactive</Badge>}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Coverage: {org.coverage_area}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(org)}
                      title="Edit Organization"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resetPassword(org.id, org.name)}
                      title="Reset Password"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteDialog({ isOpen: true, orgId: org.id, orgName: org.name })}
                      title="Delete Organization"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={org.is_active}
                      onCheckedChange={() => toggleActive(org.id, org.is_active)}
                      title={org.is_active ? "Disable Organization" : "Enable Organization"}
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {org.description && (
                  <p className="text-sm text-muted-foreground">{org.description}</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Access Code</Label>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-3 py-2 rounded text-lg font-mono">
                        {org.access_code}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(org.access_code, 'Access code')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Admin URL</Label>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-3 py-2 rounded text-sm font-mono flex-1">
                        /civic-auth?code={org.access_code}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(`${window.location.origin}/civic-auth?code=${org.access_code}`, 'Admin URL')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {(org.meeting_info || org.meeting_address) && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Meeting Information</Label>
                    <div className="text-sm text-muted-foreground">
                      {org.meeting_info && <div>Schedule: {org.meeting_info}</div>}
                      {org.meeting_address && <div>Location: {org.meeting_address}</div>}
                    </div>
                  </div>
                )}

                {(org.contact_info?.email || org.contact_info?.phone || org.contact_info?.website) && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Contact Information</Label>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {org.contact_info.email && <div>Email: {org.contact_info.email}</div>}
                      {org.contact_info.phone && <div>Phone: {org.contact_info.phone}</div>}
                      {org.contact_info.website && <div>Website: {org.contact_info.website}</div>}
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Created: {new Date(org.created_at).toLocaleDateString()}
                </div>
              </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="community-boards" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">Community Boards</h3>
              <p className="text-sm text-muted-foreground">
                Upload a CSV file or create individual community boards.
              </p>
            </div>
            <Button size="lg" onClick={() => handleCreateNew('community_board')}>
              <Plus className="h-5 w-5 mr-2" />
              Create Community Board
            </Button>
          </div>
          
          <CivicOrgCSVUpload onUploadComplete={fetchOrganizations} organizationType="community_board" />

          <div className="grid gap-4">
            {organizations.filter(org => org.organization_type === 'community_board').length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No community boards yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Upload a CSV file or create a community board individually.
                  </p>
                  <Button onClick={() => handleCreateNew('community_board')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Community Board
                  </Button>
                </CardContent>
              </Card>
            ) : (
              organizations.filter(org => org.organization_type === 'community_board').map((org) => (
                <Card key={org.id} className={org.is_active ? "" : "opacity-60"}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {org.name}
                          {!org.is_active && <Badge variant="secondary">Inactive</Badge>}
                          <Badge variant="outline">Community Board</Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Coverage: {org.coverage_area}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(org)}
                          title="Edit Organization"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resetPassword(org.id, org.name)}
                          title="Reset Password"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteDialog({ isOpen: true, orgId: org.id, orgName: org.name })}
                          title="Delete Organization"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Switch
                          checked={org.is_active}
                          onCheckedChange={() => toggleActive(org.id, org.is_active)}
                          title={org.is_active ? "Disable Organization" : "Enable Organization"}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {org.description && (
                      <p className="text-sm text-muted-foreground">{org.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Access Code</Label>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-3 py-2 rounded text-lg font-mono">
                            {org.access_code}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(org.access_code, 'Access code')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Admin URL</Label>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-3 py-2 rounded text-sm font-mono flex-1">
                            /civic-auth?code={org.access_code}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(`${window.location.origin}/civic-auth?code=${org.access_code}`, 'Admin URL')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {(org.meeting_info || org.meeting_address) && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Meeting Information</Label>
                        <div className="text-sm text-muted-foreground">
                          {org.meeting_info && <div>Schedule: {org.meeting_info}</div>}
                          {org.meeting_address && <div>Location: {org.meeting_address}</div>}
                        </div>
                      </div>
                    )}

                    {(org.contact_info?.email || org.contact_info?.phone || org.contact_info?.website) && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Contact Information</Label>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {org.contact_info.email && <div>Email: {org.contact_info.email}</div>}
                          {org.contact_info.phone && <div>Phone: {org.contact_info.phone}</div>}
                          {org.contact_info.website && <div>Website: {org.contact_info.website}</div>}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Created: {new Date(org.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="police-councils" className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">Police Councils</h3>
              <p className="text-sm text-muted-foreground">
                Upload a CSV file or create individual police councils.
              </p>
            </div>
            <Button size="lg" onClick={() => handleCreateNew('police_council')}>
              <Plus className="h-5 w-5 mr-2" />
              Create Police Council
            </Button>
          </div>
          
          <CivicOrgCSVUpload onUploadComplete={fetchOrganizations} organizationType="police_council" />

          <div className="grid gap-4">
            {organizations.filter(org => org.organization_type === 'police_council').length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No police councils yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Upload a CSV file or create a police council individually.
                  </p>
                  <Button onClick={() => handleCreateNew('police_council')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Police Council
                  </Button>
                </CardContent>
              </Card>
            ) : (
              organizations.filter(org => org.organization_type === 'police_council').map((org) => (
                <Card key={org.id} className={org.is_active ? "" : "opacity-60"}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {org.name}
                          {!org.is_active && <Badge variant="secondary">Inactive</Badge>}
                          <Badge variant="outline">Police Council</Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Coverage: {org.coverage_area}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(org)}
                          title="Edit Organization"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resetPassword(org.id, org.name)}
                          title="Reset Password"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteDialog({ isOpen: true, orgId: org.id, orgName: org.name })}
                          title="Delete Organization"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Switch
                          checked={org.is_active}
                          onCheckedChange={() => toggleActive(org.id, org.is_active)}
                          title={org.is_active ? "Disable Organization" : "Enable Organization"}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {org.description && (
                      <p className="text-sm text-muted-foreground">{org.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Access Code</Label>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-3 py-2 rounded text-lg font-mono">
                            {org.access_code}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(org.access_code, 'Access code')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Admin URL</Label>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-3 py-2 rounded text-sm font-mono flex-1">
                            /civic-auth?code={org.access_code}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(`${window.location.origin}/civic-auth?code=${org.access_code}`, 'Admin URL')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {(org.meeting_info || org.meeting_address) && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Meeting Information</Label>
                        <div className="text-sm text-muted-foreground">
                          {org.meeting_info && <div>Schedule: {org.meeting_info}</div>}
                          {org.meeting_address && <div>Location: {org.meeting_address}</div>}
                        </div>
                      </div>
                    )}

                    {(org.contact_info?.email || org.contact_info?.phone || org.contact_info?.website) && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Contact Information</Label>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {org.contact_info.email && <div>Email: {org.contact_info.email}</div>}
                          {org.contact_info.phone && <div>Phone: {org.contact_info.phone}</div>}
                          {org.contact_info.website && <div>Website: {org.contact_info.website}</div>}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Created: {new Date(org.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialog.isOpen} onOpenChange={(open) => setResetPasswordDialog({isOpen: open})}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Password Generated</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              A new password has been generated for <strong>{resetPasswordDialog.orgName}</strong>:
            </p>
            
            <div className="space-y-2">
              <Label>New Password</Label>
              <div className="flex items-center gap-2">
                <code className="bg-muted px-3 py-2 rounded font-mono text-lg flex-1">
                  {resetPasswordDialog.newPassword}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(resetPasswordDialog.newPassword || '', 'New password')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800">
                <strong>Important:</strong> Make sure to copy this password now. 
                You won't be able to see it again once you close this dialog.
              </p>
            </div>

            <Button 
              onClick={() => setResetPasswordDialog({isOpen: false})} 
              className="w-full"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => setDeleteDialog({ isOpen: open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Civic Organization
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{deleteDialog.orgName}</strong>? 
              This action cannot be undone and will remove all associated data including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Organization profile and access codes</li>
                <li>All events created by this organization</li>
                <li>Announcements, newsletters, and gallery items</li>
                <li>Leadership and important links data</li>
              </ul>
              <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-800">
                  <strong>Tip:</strong> If you want to temporarily hide this organization, 
                  you can disable it using the toggle switch instead of deleting.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}