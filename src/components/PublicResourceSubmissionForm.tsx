import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { publicResourceSchema } from "@/lib/validationSchemas";
import { z } from 'zod';
import { Upload, X, Wand2, Building2 } from "lucide-react";
import { removeBackground, loadImage } from "@/utils/backgroundRemoval";

const CATEGORIES = [
  "Arts",
  "Community Resources",
  "Conflict Management",
  "Cultural",
  "Educational",
  "Environmental",
  "Food",
  "Legal Services",
  "Mental Health/Wellness",
  "Senior Services",
  "Social",
  "Sports",
  "Youth"
];

interface PublicResourceSubmissionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PublicResourceSubmissionForm({ open, onOpenChange }: PublicResourceSubmissionFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [removingBackgroundLogo, setRemovingBackgroundLogo] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [isDragOverLogo, setIsDragOverLogo] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    organization_name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    categories: [] as string[],
    submitter_name: '',
    submitter_phone: ''
  });

  const resetForm = () => {
    setFormData({
      organization_name: '',
      description: '',
      phone: '',
      email: '',
      address: '',
      website: '',
      categories: [],
      submitter_name: '',
      submitter_phone: ''
    });
    setSelectedLogoFile(null);
    setLogoPreviewUrl(null);
    setErrors({});
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `resource-logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleLogoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processLogoFile(file);
  };

  const processLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedLogoFile(file);
    const url = URL.createObjectURL(file);
    setLogoPreviewUrl(url);
  };

  const handleRemoveLogoBackground = async () => {
    if (!selectedLogoFile) return;

    setRemovingBackgroundLogo(true);
    try {
      const imageElement = await loadImage(selectedLogoFile);
      const processedBlob = await removeBackground(imageElement);
      
      const processedFile = new File([processedBlob], selectedLogoFile.name, {
        type: 'image/png'
      });
      
      setSelectedLogoFile(processedFile);
      const url = URL.createObjectURL(processedBlob);
      setLogoPreviewUrl(url);
      
      toast({
        title: "Success",
        description: "Background removed successfully",
      });
    } catch (error) {
      console.error('Error removing background:', error);
      toast({
        title: "Error",
        description: "Failed to remove background. You can still use the original image.",
        variant: "destructive",
      });
    } finally {
      setRemovingBackgroundLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = publicResourceSchema.parse(formData);

      setLoading(true);

      let logoUrl = '';

      if (selectedLogoFile) {
        setUploadingLogo(true);
        logoUrl = await uploadImage(selectedLogoFile);
      }

      const dataToSave = {
        type: 'resource',
        organization_name: validatedData.organization_name,
        description: validatedData.description,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        address: validatedData.address || null,
        website: validatedData.website || null,
        logo_url: logoUrl || null,
        cover_photo_url: null,
        categories: validatedData.categories,
        submitted_by: null,
        submitter_name: formData.submitter_name || null,
        submitter_phone: formData.submitter_phone || null
      };

      const { error } = await supabase
        .from("pending_resources")
        .insert(dataToSave);

      if (error) throw error;

      toast({
        title: "Submission Received",
        description: "Thank you! Your resource will be reviewed within 2-3 business days.",
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
        console.error('Error submitting resource:', error);
        toast({
          title: "Error",
          description: "Failed to submit resource. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setUploadingLogo(false);
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
            <Building2 className="h-5 w-5" />
            Add Your Organization
          </DialogTitle>
          <DialogDescription>
            Submit your organization for review. All submissions are reviewed before being published.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organization_name">Organization Name *</Label>
            <Input
              id="organization_name"
              value={formData.organization_name}
              onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
              placeholder="Enter organization name"
              required
            />
            {errors.organization_name && <p className="text-sm text-destructive">{errors.organization_name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your organization and services"
              rows={4}
              required
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.categories[0] || ''}
              onValueChange={(value) => setFormData({ ...formData, categories: [value] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categories && <p className="text-sm text-destructive">{errors.categories}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
                required
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@organization.org"
                required
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (Required if no address provided)</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://www.organization.org"
            />
            {errors.website && <p className="text-sm text-destructive">{errors.website}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address (Required if no website provided)</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St, City, State ZIP"
            />
            {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Logo (Optional)</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragOverLogo ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
              onClick={() => logoFileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragOverLogo(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragOverLogo(false); }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOverLogo(false);
                const files = e.dataTransfer.files;
                if (files.length > 0) processLogoFile(files[0]);
              }}
            >
              {logoPreviewUrl ? (
                <div className="relative">
                  <img src={logoPreviewUrl} alt="Logo preview" className="max-h-40 mx-auto rounded" />
                  <div className="flex gap-2 justify-center mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveLogoBackground();
                      }}
                      disabled={removingBackgroundLogo}
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      {removingBackgroundLogo ? 'Removing...' : 'Remove Background'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLogoFile(null);
                        setLogoPreviewUrl(null);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click or drag to upload logo</p>
                </>
              )}
            </div>
            <input
              ref={logoFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoFileSelect}
              className="hidden"
            />
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
            <Button type="submit" disabled={loading || uploadingLogo}>
              {loading ? 'Submitting...' : 'Submit Resource'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}