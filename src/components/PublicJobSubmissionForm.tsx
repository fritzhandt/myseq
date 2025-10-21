import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { publicJobSchema } from '@/lib/validationSchemas';
import { z } from 'zod';
import { Briefcase } from 'lucide-react';

interface PublicJobSubmissionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PublicJobSubmissionForm({ open, onOpenChange }: PublicJobSubmissionFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    employer: '',
    title: '',
    location: '',
    salary: '',
    description: '',
    apply_info: '',
    is_apply_link: false,
    category: 'government' as 'government' | 'private' | 'nonprofit',
    subcategory: '',
    contact_email: '',
    contact_phone: '',
    submitter_name: '',
    submitter_phone: ''
  });

  const resetForm = () => {
    setFormData({
      employer: '',
      title: '',
      location: '',
      salary: '',
      description: '',
      apply_info: '',
      is_apply_link: false,
      category: 'government',
      subcategory: '',
      contact_email: '',
      contact_phone: '',
      submitter_name: '',
      submitter_phone: ''
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate form data
      const validatedData = publicJobSchema.parse({
        ...formData,
        subcategory: formData.subcategory || undefined
      });

      setLoading(true);

      // Store job data in pending_resources with type 'job'
      // We'll encode job-specific fields in the description and other fields
      const jobDataForStorage = {
        type: 'job',
        organization_name: validatedData.employer,
        description: JSON.stringify({
          title: validatedData.title,
          description: validatedData.description,
          salary: validatedData.salary,
          location: validatedData.location,
          category: validatedData.category,
          subcategory: validatedData.subcategory || null,
          is_apply_link: validatedData.is_apply_link
        }),
        website: validatedData.apply_info,
        email: validatedData.contact_email || null,
        phone: validatedData.contact_phone || null,
        categories: [validatedData.category],
        submitted_by: null, // Public submission
        submitter_name: formData.submitter_name || null,
        submitter_phone: formData.submitter_phone || null
      };

      const { error } = await supabase
        .from("pending_resources")
        .insert(jobDataForStorage);

      if (error) throw error;

      toast({
        title: "Submission Received",
        description: "Thank you! Your job posting will be reviewed within 2-3 business days.",
      });

      resetForm();
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
        console.error('Error submitting job:', error);
        toast({
          title: "Error",
          description: "Failed to submit job posting. Please try again.",
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
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Submit a Job Posting
          </DialogTitle>
          <DialogDescription>
            Submit your job posting for review. All submissions are reviewed before being published.
          </DialogDescription>
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

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value: 'government' | 'private' | 'nonprofit') => {
                setFormData({ ...formData, category: value });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="private">Private Sector</SelectItem>
                <SelectItem value="nonprofit">Nonprofit</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
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
            <Label htmlFor="salary">Salary *</Label>
            <Input
              id="salary"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              placeholder="e.g., $50,000 - $70,000"
              required
            />
            {errors.salary && <p className="text-sm text-destructive">{errors.salary}</p>}
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

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Your Contact Information (Optional)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Provide your contact information so we can reach you if we have questions about this submission.
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="submitter_name">Your Name</Label>
                <Input
                  id="submitter_name"
                  value={formData.submitter_name}
                  onChange={(e) => setFormData({ ...formData, submitter_name: e.target.value })}
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="submitter_phone">Your Phone</Label>
                <Input
                  id="submitter_phone"
                  value={formData.submitter_phone}
                  onChange={(e) => setFormData({ ...formData, submitter_phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Job Posting'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}