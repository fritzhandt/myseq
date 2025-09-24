import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link, Plus, Edit, Trash2, Save, Loader2, ExternalLink, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CivicImportantLinksManagerProps {
  orgId: string;
}

interface ImportantLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

const CivicImportantLinksManager = ({ orgId }: CivicImportantLinksManagerProps) => {
  const [links, setLinks] = useState<ImportantLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState<ImportantLink | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    fetchLinks();
  }, [orgId]);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('civic_important_links')
        .select('*')
        .eq('civic_org_id', orgId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching links:', error);
      toast({
        title: "Error",
        description: "Failed to load important links",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateUrl = (url: string) => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.toString();
    } catch {
      return null;
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.url.trim()) {
      toast({
        title: "Error",
        description: "Please fill in title and URL",
        variant: "destructive",
      });
      return;
    }

    const validatedUrl = validateUrl(formData.url);
    if (!validatedUrl) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      if (editingLink) {
        // Update existing link
        const { error } = await supabase
          .from('civic_important_links')
          .update({
            title: formData.title,
            url: validatedUrl,
            description: formData.description || null,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingLink.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Link updated successfully",
        });
      } else {
        // Create new link
        const maxOrder = links.length > 0 ? Math.max(...links.map(l => l.order_index)) : -1;
        
        const { error } = await supabase
          .from('civic_important_links')
          .insert({
            civic_org_id: orgId,
            title: formData.title,
            url: validatedUrl,
            description: formData.description || null,
            order_index: maxOrder + 1,
            is_active: formData.is_active,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Link created successfully",
        });
      }

      setFormData({ title: "", url: "", description: "", is_active: true });
      setEditingLink(null);
      setIsDialogOpen(false);
      fetchLinks();
    } catch (error) {
      console.error('Error saving link:', error);
      toast({
        title: "Error",
        description: "Failed to save link",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (link: ImportantLink) => {
    setEditingLink(link);
    setFormData({
      title: link.title,
      url: link.url,
      description: link.description || "",
      is_active: link.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('civic_important_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Link deleted successfully",
      });

      fetchLinks();
    } catch (error) {
      console.error('Error deleting link:', error);
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ title: "", url: "", description: "", is_active: true });
    setEditingLink(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Important Links
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Link
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingLink ? "Edit Link" : "Add New Link"}
                </DialogTitle>
                <DialogDescription>
                  Create buttons with links to important resources, websites, or documents.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Register to Vote"
                  />
                </div>
                <div>
                  <Label htmlFor="url">URL *</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="e.g., https://example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of what this link leads to"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {editingLink ? "Update" : "Create"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <div className="text-center py-8">
            <Link className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No important links yet</h3>
            <p className="text-muted-foreground">
              Create buttons with links to help your community access important resources.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <div key={link.id} className="flex items-center gap-3 p-4 border rounded-lg">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{link.title}</h3>
                    {!link.is_active && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{link.url}</p>
                  {link.description && (
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(link.url, '_blank')}
                    title="Test link"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(link)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(link.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CivicImportantLinksManager;