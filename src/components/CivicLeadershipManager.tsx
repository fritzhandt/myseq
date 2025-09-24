import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Edit, Trash2, Upload, Save, Loader2, MoveUp, MoveDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CivicLeadershipManagerProps {
  orgId: string;
}

interface Leader {
  id: string;
  name: string;
  title: string;
  contact_info: any;
  photo_url?: string;
  order_index: number;
}

const CivicLeadershipManager = ({ orgId }: CivicLeadershipManagerProps) => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLeader, setEditingLeader] = useState<Leader | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    photo: null as File | null,
  });

  useEffect(() => {
    fetchLeaders();
  }, [orgId]);

  const fetchLeaders = async () => {
    try {
      const { data, error } = await supabase
        .from('civic_leadership')
        .select('*')
        .eq('civic_org_id', orgId)
        .order('order_index');

      if (error) throw error;

      setLeaders(data || []);
    } catch (error) {
      console.error('Error fetching leaders:', error);
      toast({
        title: "Error",
        description: "Failed to load leadership team",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${orgId}/leadership/${formData.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('civic-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      setUploadProgress(100);
      return uploadData.path;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please fill in name and title",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      let photoUrl = editingLeader?.photo_url;

      // Upload new photo if provided
      if (formData.photo) {
        photoUrl = await uploadPhoto(formData.photo);
      }

      const contactInfo = {
        email: formData.email || null,
        phone: formData.phone || null,
      };

      if (editingLeader) {
        // Update existing leader
        const { error } = await supabase
          .from('civic_leadership')
          .update({
            name: formData.name,
            title: formData.title,
            contact_info: contactInfo,
            photo_url: photoUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingLeader.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Leader updated successfully",
        });
      } else {
        // Create new leader
        const maxOrder = Math.max(...leaders.map(l => l.order_index), -1);
        
        const { error } = await supabase
          .from('civic_leadership')
          .insert({
            civic_org_id: orgId,
            name: formData.name,
            title: formData.title,
            contact_info: contactInfo,
            photo_url: photoUrl,
            order_index: maxOrder + 1,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Leader added successfully",
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchLeaders();
    } catch (error) {
      console.error('Error saving leader:', error);
      toast({
        title: "Error",
        description: "Failed to save leader",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (leader: Leader) => {
    setEditingLeader(leader);
    setFormData({
      name: leader.name,
      title: leader.title,
      email: leader.contact_info?.email || "",
      phone: leader.contact_info?.phone || "",
      photo: null,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (leader: Leader) => {
    try {
      // Delete photo from storage if exists
      if (leader.photo_url) {
        await supabase.storage
          .from('civic-files')
          .remove([leader.photo_url]);
      }

      // Delete database record
      const { error } = await supabase
        .from('civic_leadership')
        .delete()
        .eq('id', leader.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Leader deleted successfully",
      });

      fetchLeaders();
    } catch (error) {
      console.error('Error deleting leader:', error);
      toast({
        title: "Error",
        description: "Failed to delete leader",
        variant: "destructive",
      });
    }
  };

  const moveLeader = async (leaderId: string, direction: 'up' | 'down') => {
    const currentIndex = leaders.findIndex(l => l.id === leaderId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= leaders.length) return;

    try {
      const currentLeader = leaders[currentIndex];
      const targetLeader = leaders[targetIndex];

      // Swap order_index values
      await Promise.all([
        supabase
          .from('civic_leadership')
          .update({ order_index: targetLeader.order_index })
          .eq('id', currentLeader.id),
        supabase
          .from('civic_leadership')
          .update({ order_index: currentLeader.order_index })
          .eq('id', targetLeader.id),
      ]);

      fetchLeaders();
    } catch (error) {
      console.error('Error reordering leaders:', error);
      toast({
        title: "Error",
        description: "Failed to reorder leaders",
        variant: "destructive",
      });
    }
  };

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage.from('civic-files').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      title: "",
      email: "",
      phone: "",
      photo: null,
    });
    setEditingLeader(null);
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
            <Users className="h-5 w-5" />
            Leadership Team
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Leader
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingLeader ? "Edit Leader" : "Add New Leader"}
                </DialogTitle>
                <DialogDescription>
                  Add leadership team members with their contact information and photos.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">Title/Position</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., President, Secretary"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="photo">Photo (Optional)</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Image files only, maximum 5MB
                  </p>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} />
                    <p className="text-sm text-muted-foreground text-center">
                      Uploading photo... {uploadProgress}%
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    disabled={saving || uploading}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving || uploading}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {editingLeader ? "Update" : "Add"}
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
        {leaders.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No leaders added yet</h3>
            <p className="text-muted-foreground">
              Add your leadership team to showcase your organization's structure.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaders.map((leader, index) => (
              <div key={leader.id} className="flex items-center gap-4 p-4 border rounded-lg">
                {leader.photo_url ? (
                  <img
                    src={getFileUrl(leader.photo_url)}
                    alt={leader.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg">{leader.name}</h3>
                  <p className="text-muted-foreground">{leader.title}</p>
                  {(leader.contact_info?.email || leader.contact_info?.phone) && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {leader.contact_info?.email && (
                        <span className="mr-4">✉ {leader.contact_info.email}</span>
                      )}
                      {leader.contact_info?.phone && (
                        <span>📞 {leader.contact_info.phone}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveLeader(leader.id, 'up')}
                    disabled={index === 0}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveLeader(leader.id, 'down')}
                    disabled={index === leaders.length - 1}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(leader)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(leader)}
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

export default CivicLeadershipManager;