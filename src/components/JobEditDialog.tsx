import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

interface Job {
  id: string;
  employer: string;
  title: string;
  location: string;
  salary: string;
  description: string;
  apply_info: string;
  is_apply_link: boolean;
  category: string;
  subcategory: string | null;
}

interface JobEditDialogProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function JobEditDialog({ job, open, onOpenChange, onSuccess }: JobEditDialogProps) {
  const { toast } = useToast();
  const { isSubAdmin, isMainAdmin } = useUserRole();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    employer: '',
    title: '',
    location: '',
    salary: '',
    description: '',
    apply_info: '',
    is_apply_link: false,
    category: 'government',
    subcategory: 'city'
  });

  useEffect(() => {
    if (job) {
      setFormData({
        employer: job.employer,
        title: job.title,
        location: job.location,
        salary: job.salary,
        description: job.description,
        apply_info: job.apply_info,
        is_apply_link: job.is_apply_link,
        category: job.category,
        subcategory: job.subcategory || (job.category === 'government' ? 'city' : 'open_positions')
      });
    }
  }, [job]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Sub-admins create pending modification request
      if (isSubAdmin) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name, phone_number')
          .eq('user_id', user.id)
          .maybeSingle();

        const { error } = await supabase
          .from("pending_job_modifications")
          .insert({
            job_id: job.id,
            action: 'update',
            modified_data: formData,
            submitted_by: user.id,
            submitter_name: profile?.full_name || null,
            submitter_phone: profile?.phone_number || null
          });

        if (error) throw error;

        toast({
          title: "Request Submitted",
          description: "Your edit request has been submitted for approval",
        });
      } else {
        // Main admins update directly
        const { error } = await supabase
          .from('jobs')
          .update(formData)
          .eq('id', job.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Job updated successfully",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating job:', error);
      toast({
        title: "Error",
        description: "Failed to update job",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employer">Employer *</Label>
            <Input
              id="employer"
              value={formData.employer}
              onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: 'government' | 'private_sector') => {
                  setFormData(prev => ({
                    ...prev,
                    category: value,
                    subcategory: value === 'government' ? 'city' : 'open_positions'
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="private_sector">Private Sector</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory *</Label>
              <Select
                value={formData.subcategory}
                onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formData.category === 'government' ? (
                    <>
                      <SelectItem value="city">City</SelectItem>
                      <SelectItem value="state">State</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="open_positions">Open Positions</SelectItem>
                      <SelectItem value="internships">Internships</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">Salary *</Label>
            <Input
              id="salary"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apply_info">Application Info/Link *</Label>
            <Input
              id="apply_info"
              value={formData.apply_info}
              onChange={(e) => setFormData({ ...formData, apply_info: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_apply_link"
              checked={formData.is_apply_link}
              onCheckedChange={(checked) => setFormData({ ...formData, is_apply_link: checked })}
            />
            <Label htmlFor="is_apply_link">Application info is a clickable link</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
