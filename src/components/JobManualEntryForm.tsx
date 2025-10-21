import { useState } from 'react';
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
import { z } from 'zod';

const jobSchema = z.object({
  employer: z.string().trim().min(1, "Employer is required").max(200, "Employer must be less than 200 characters"),
  title: z.string().trim().min(1, "Job title is required").max(200, "Title must be less than 200 characters"),
  location: z.string().trim().min(1, "Location is required").max(200, "Location must be less than 200 characters"),
  description: z.string().trim().min(1, "Description is required").max(5000, "Description must be less than 5000 characters"),
  apply_info: z.string().trim().min(1, "Application info is required").max(500, "Application info must be less than 500 characters"),
  is_apply_link: z.boolean(),
  category: z.enum(['government', 'private_sector']),
  subcategory: z.string().nullable()
});

interface JobManualEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function JobManualEntryForm({ open, onOpenChange, onSuccess }: JobManualEntryFormProps) {
  const { toast } = useToast();
  const { isSubAdmin, isMainAdmin } = useUserRole();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    employer: '',
    title: '',
    location: '',
    description: '',
    apply_info: '',
    is_apply_link: false,
    category: 'government' as 'government' | 'private' | 'internships',
    subcategory: 'city' as 'city' | 'state'
  });

  const resetForm = () => {
    setFormData({
      employer: '',
      title: '',
      location: '',
      description: '',
      apply_info: '',
      is_apply_link: false,
      category: 'government',
      subcategory: 'city'
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate form data
      const validatedData = jobSchema.parse({
        ...formData,
        subcategory: formData.category === 'government' ? formData.subcategory : null
      });

      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const jobData = {
        ...validatedData,
        is_active: true
      };

      // Sub-admins create pending resource request
      if (isSubAdmin) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name, phone_number')
          .eq('user_id', user.id)
          .maybeSingle();

        const { error } = await supabase
          .from("pending_resources")
          .insert({
            type: 'job',
            organization_name: validatedData.employer,
            description: validatedData.description,
            categories: [validatedData.category],
            submitted_by: user.id,
            submitter_name: profile?.full_name || null,
            submitter_phone: profile?.phone_number || null,
            // Store additional job-specific data in a JSON field we'll need to add
            website: validatedData.apply_info
          });

        if (error) throw error;

        toast({
          title: "Request Submitted",
          description: "Your job posting has been submitted for approval",
        });
      } else {
        // Main admins insert directly
        const { error } = await supabase
          .from('jobs')
          .insert(jobData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Job posted successfully",
        });
      }

      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
        toast({
          title: "Validation Error",
          description: "Please check the form for errors",
          variant: "destructive",
        });
      } else {
        console.error('Error creating job:', error);
        toast({
          title: "Error",
          description: "Failed to create job posting",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleCancel();
      else onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Job</DialogTitle>
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
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="employer">Employer *</Label>
            <Input
              id="employer"
              value={formData.employer}
              onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
              required
            />
            {errors.employer && <p className="text-sm text-destructive">{errors.employer}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: 'government' | 'private' | 'internships') => {
                  setFormData({ 
                    ...formData, 
                    category: value,
                    subcategory: value === 'government' ? 'city' : 'city'
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="government">City Government</SelectItem>
                  <SelectItem value="state">State Government</SelectItem>
                  <SelectItem value="private">Private Sector</SelectItem>
                  <SelectItem value="internships">Internships</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>

            {formData.category === 'government' && (
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory *</Label>
                <Select
                  value={formData.subcategory}
                  onValueChange={(value: 'city' | 'state') => 
                    setFormData({ ...formData, subcategory: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="city">City</SelectItem>
                    <SelectItem value="state">State</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., New York, NY"
              required
            />
            {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              placeholder="Enter detailed job description, requirements, and responsibilities..."
              required
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="apply_info">Application Info/Link *</Label>
            <Input
              id="apply_info"
              value={formData.apply_info}
              onChange={(e) => setFormData({ ...formData, apply_info: e.target.value })}
              placeholder="e.g., https://company.com/apply or email@company.com"
              required
            />
            {errors.apply_info && <p className="text-sm text-destructive">{errors.apply_info}</p>}
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
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
