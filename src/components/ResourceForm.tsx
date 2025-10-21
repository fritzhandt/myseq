import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { X, Upload, Trash2, Wand2 } from "lucide-react";
import { removeBackground, loadImage } from "@/utils/backgroundRemoval";

interface Resource {
  id?: string;
  organization_name: string;
  description: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  logo_url?: string;
  cover_photo_url?: string;
  categories: string[]; // Still array for database compatibility
  category?: string; // Single category for form
}

interface ResourceFormProps {
  resource?: Resource;
  onClose: () => void;
  onSave: () => void;
  isBusinessOpportunity?: boolean;
}

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

export default function ResourceForm({ resource, onClose, onSave, isBusinessOpportunity = false }: ResourceFormProps) {
  const { toast } = useToast();
  const { isSubAdmin } = useUserRole();
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [removingBackgroundLogo, setRemovingBackgroundLogo] = useState(false);
  const [removingBackgroundCover, setRemovingBackgroundCover] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(resource?.logo_url || null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(resource?.cover_photo_url || null);
  const [isDragOverLogo, setIsDragOverLogo] = useState(false);
  const [isDragOverCover, setIsDragOverCover] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Resource>({
    organization_name: resource?.organization_name || "",
    description: resource?.description || "",
    phone: resource?.phone || "",
    email: resource?.email || "",
    address: resource?.address || "",
    website: resource?.website || "",
    logo_url: resource?.logo_url || "",
    cover_photo_url: resource?.cover_photo_url || "",
    categories: resource?.categories || [],
    category: resource?.categories?.[0] || "", // Single category
  });

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category: category,
      categories: [category] // Store as array for database
    }));
  };

  const handleLogoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processLogoFile(file);
    }
  };

  const handleCoverFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processCoverFile(file);
    }
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

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
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

  const processCoverFile = (file: File) => {
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
        description: "Image must be smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreviewUrl(url);
  };

  const handleLogoDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverLogo(true);
  };

  const handleLogoDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverLogo(false);
  };

  const handleLogoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverLogo(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processLogoFile(files[0]);
    }
  };

  const handleCoverDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverCover(true);
  };

  const handleCoverDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverCover(false);
  };

  const handleCoverDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverCover(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processCoverFile(files[0]);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `resource-logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleRemoveLogoBackground = async () => {
    if (!selectedLogoFile) return;

    setRemovingBackgroundLogo(true);
    try {
      const imageElement = await loadImage(selectedLogoFile);
      const processedBlob = await removeBackground(imageElement);
      
      // Create a new file from the processed blob
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

  const handleRemoveCoverBackground = async () => {
    if (!selectedCoverFile) return;

    setRemovingBackgroundCover(true);
    try {
      const imageElement = await loadImage(selectedCoverFile);
      const processedBlob = await removeBackground(imageElement);
      
      // Create a new file from the processed blob
      const processedFile = new File([processedBlob], selectedCoverFile.name, {
        type: 'image/png'
      });
      
      setSelectedCoverFile(processedFile);
      const url = URL.createObjectURL(processedBlob);
      setCoverPreviewUrl(url);
      
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
      setRemovingBackgroundCover(false);
    }
  };

  const handleRemoveLogoImage = () => {
    setSelectedLogoFile(null);
    setLogoPreviewUrl(null);
    setFormData(prev => ({ ...prev, logo_url: "" }));
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = "";
    }
  };

  const handleRemoveCoverImage = () => {
    setSelectedCoverFile(null);
    setCoverPreviewUrl(null);
    setFormData(prev => ({ ...prev, cover_photo_url: "" }));
    if (coverFileInputRef.current) {
      coverFileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.organization_name.trim() || !formData.description.trim()) {
      toast({
        title: "Error",
        description: "Organization name and description are required",
        variant: "destructive",
      });
      return;
    }

    // Only validate categories for resources, not business opportunities
    if (!isBusinessOpportunity && formData.categories.length === 0) {
      toast({
        title: "Error", 
        description: "Please select at least one category",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let logoUrl = formData.logo_url;
      let coverPhotoUrl = formData.cover_photo_url;

      // Upload logo image if a new file is selected
      if (selectedLogoFile) {
        setUploadingLogo(true);
        logoUrl = await uploadImage(selectedLogoFile);
      }

      // Upload cover photo if a new file is selected
      if (selectedCoverFile) {
        setUploadingCover(true);
        coverPhotoUrl = await uploadImage(selectedCoverFile);
      }

      const dataToSave = {
        organization_name: formData.organization_name,
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        website: formData.website,
        logo_url: logoUrl,
        cover_photo_url: coverPhotoUrl,
        categories: isBusinessOpportunity ? [] : formData.categories, // Empty array for business opportunities
        type: isBusinessOpportunity ? 'business_opportunity' : 'resource'
      };

      if (resource?.id) {
        // Sub-admins editing: create pending modification request
        if (isSubAdmin) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          // Fetch profile info
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name, phone_number')
            .eq('user_id', user.id)
            .maybeSingle();

          const { error } = await supabase
            .from("pending_resource_modifications")
            .insert({
              resource_id: resource.id,
              action: 'edit',
              modified_data: dataToSave,
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
            .from("resources")
            .update(dataToSave)
            .eq("id", resource.id);

          if (error) throw error;

          toast({
            title: "Success",
            description: "Resource updated successfully",
          });
        }
        
        onSave();
        onClose();
      } else {
        // New resources: sub-admins go to pending table, others go directly to main table
        const tableName = isSubAdmin ? 'pending_resources' : 'resources';
        const insertData = isSubAdmin 
          ? { ...dataToSave, submitted_by: (await supabase.auth.getUser()).data.user?.id }
          : dataToSave;

        const { error } = await supabase
          .from(tableName)
          .insert([insertData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: isSubAdmin 
            ? "Resource submitted for approval! You'll be notified once it's reviewed."
            : "Resource created successfully",
        });
        
        // Close the form after creating new resource
        onSave();
        onClose();
      }
    } catch (error) {
      console.error("Error saving resource:", error);
      toast({
        title: "Error",
        description: "Failed to save resource",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadingLogo(false);
      setUploadingCover(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {resource 
              ? (isBusinessOpportunity ? "Edit Business Opportunity" : "Edit Resource")
              : (isBusinessOpportunity ? "Create New Business Opportunity" : "Create New Resource")
            }
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close form"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="organization_name">
                Organization Name
                <span aria-label="required" className="text-destructive ml-1">*</span>
              </Label>
              <p id="organization_name-help" className="sr-only">
                Enter the full name of the organization
              </p>
              <Input
                id="organization_name"
                value={formData.organization_name}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, organization_name: e.target.value }))
                }
                placeholder="Enter organization name"
                aria-describedby="organization_name-help"
                aria-required="true"
              />
            </div>

            <div>
              <Label htmlFor="description">
                Description
                <span aria-label="required" className="text-destructive ml-1">*</span>
              </Label>
              <p id="description-help" className="text-sm text-muted-foreground mt-1">
                Provide a clear description of the organization and its services
              </p>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, description: e.target.value }))
                }
                placeholder="Enter description"
                rows={3}
                aria-describedby="description-help"
                aria-required="true"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <p id="phone-help" className="sr-only">
                Contact phone number for the organization
              </p>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, phone: e.target.value }))
                }
                placeholder="(555) 123-4567"
                aria-describedby="phone-help"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <p id="email-help" className="sr-only">
                Contact email address for the organization
              </p>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, email: e.target.value }))
                }
                placeholder="contact@organization.com"
                aria-describedby="email-help"
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, address: e.target.value }))
                }
                placeholder="123 Main St, City, State 12345"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, website: e.target.value }))
                }
                placeholder="https://example.com"
              />
            </div>

            <div>
              <Label htmlFor="cover-photo-upload">Cover Photo (Optional)</Label>
              <div className="space-y-4" role="group" aria-labelledby="cover-photo-label">
                <span id="cover-photo-label" className="sr-only">Cover photo upload section</span>
                {/* Cover Photo Preview */}
                {coverPreviewUrl && (
                  <div className="relative">
                    <img
                      src={coverPreviewUrl}
                      alt="Cover photo preview"
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2"
                      onClick={handleRemoveCoverImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Cover Photo Drag and Drop Zone */}
                {!coverPreviewUrl && (
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                      isDragOverCover 
                        ? "border-primary bg-primary/5" 
                        : "border-muted-foreground/25 hover:border-muted-foreground/50"
                    }`}
                    onDragOver={handleCoverDragOver}
                    onDragLeave={handleCoverDragLeave}
                    onDrop={handleCoverDrop}
                    onClick={() => coverFileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">
                      {isDragOverCover ? "Drop cover photo here" : "Drag and drop a cover photo"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse files
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingCover}
                    >
                      Choose Cover Photo
                    </Button>
                  </div>
                )}

                {/* Cover Photo Upload Controls */}
                {coverPreviewUrl && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => coverFileInputRef.current?.click()}
                      disabled={uploadingCover}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Change Cover Photo
                    </Button>

                    {selectedCoverFile && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveCoverBackground}
                        disabled={removingBackgroundCover}
                      >
                        <Wand2 className="h-4 w-4 mr-2" />
                        {removingBackgroundCover ? "Processing..." : "Remove Background"}
                      </Button>
                    )}
                  </div>
                )}

                <input
                  ref={coverFileInputRef}
                  id="cover-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverFileSelect}
                  className="hidden"
                  aria-label="Upload cover photo"
                />

                <p className="text-xs text-muted-foreground">
                  Upload a cover photo that will appear at the top of the resource card (max 5MB)
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="logo-upload">Organization Logo (Optional)</Label>
              <div className="space-y-4" role="group" aria-labelledby="logo-label">
                <span id="logo-label" className="sr-only">Organization logo upload section</span>
                {/* Logo Preview */}
                {logoPreviewUrl && (
                  <div className="relative">
                    <img
                      src={logoPreviewUrl}
                      alt="Logo preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2"
                      onClick={handleRemoveLogoImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Logo Drag and Drop Zone */}
                {!logoPreviewUrl && (
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                      isDragOverLogo 
                        ? "border-primary bg-primary/5" 
                        : "border-muted-foreground/25 hover:border-muted-foreground/50"
                    }`}
                    onDragOver={handleLogoDragOver}
                    onDragLeave={handleLogoDragLeave}
                    onDrop={handleLogoDrop}
                    onClick={() => logoFileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">
                      {isDragOverLogo ? "Drop logo here" : "Drag and drop a logo"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse files
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingLogo}
                    >
                      Choose Logo
                    </Button>
                  </div>
                )}

                {/* Logo Upload Controls */}
                {logoPreviewUrl && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => logoFileInputRef.current?.click()}
                      disabled={uploadingLogo}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Change Logo
                    </Button>

                    {selectedLogoFile && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveLogoBackground}
                        disabled={removingBackgroundLogo}
                      >
                        <Wand2 className="h-4 w-4 mr-2" />
                        {removingBackgroundLogo ? "Processing..." : "Remove Background"}
                      </Button>
                    )}
                  </div>
                )}

                <input
                  ref={logoFileInputRef}
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileSelect}
                  className="hidden"
                  aria-label="Upload organization logo"
                />

                <p className="text-xs text-muted-foreground">
                  Upload a logo that will appear next to the organization name (max 5MB)
                </p>
              </div>
            </div>

            {!isBusinessOpportunity && (
              <div>
                <Label htmlFor="category">
                  Category
                  <span aria-label="required" className="text-destructive ml-1">*</span>
                </Label>
                <Select 
                  value={formData.category || ""} 
                  onValueChange={handleCategoryChange}
                  required
                >
                  <SelectTrigger id="category" className="mt-2" aria-required="true">
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
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading || uploadingLogo || uploadingCover || removingBackgroundLogo || removingBackgroundCover}>
                {loading || uploadingLogo || uploadingCover
                  ? (resource?.id ? "Saving..." : "Creating...")
                  : (resource?.id ? "Save Changes" : "Create Resource")
                }
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading || uploadingLogo || uploadingCover || removingBackgroundLogo || removingBackgroundCover}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}