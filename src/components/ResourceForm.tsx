import { useState, useRef, useEffect, useCallback } from "react";
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
  "Environment",
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
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // Autosave function for existing resources
  const autoSave = useCallback(async () => {
    // Only autosave for existing resources, not new ones
    if (!resource?.id) return;
    
    // Don't save if required fields are empty
    if (!formData.organization_name.trim() || !formData.description.trim() || formData.categories.length === 0) {
      return;
    }

    setAutoSaving(true);

    try {
      let logoUrl = formData.logo_url;
      let coverPhotoUrl = formData.cover_photo_url;

      // Upload logo image if a new file is selected
      if (selectedLogoFile) {
        logoUrl = await uploadImage(selectedLogoFile);
        setSelectedLogoFile(null); // Clear after upload
      }

      // Upload cover photo if a new file is selected
      if (selectedCoverFile) {
        coverPhotoUrl = await uploadImage(selectedCoverFile);
        setSelectedCoverFile(null); // Clear after upload
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
        categories: formData.categories,
        type: isBusinessOpportunity ? 'business_opportunity' : 'resource'
      };

      const { error } = await supabase
        .from("resources")
        .update(dataToSave)
        .eq("id", resource.id);

      if (error) throw error;

      setLastSaved(new Date());
    } catch (error) {
      console.error("Autosave error:", error);
      toast({
        title: "Autosave failed",
        description: "Your changes could not be saved automatically",
        variant: "destructive",
      });
    } finally {
      setAutoSaving(false);
    }
  }, [resource?.id, formData, selectedLogoFile, selectedCoverFile, isBusinessOpportunity, toast]);

  // Debounced autosave on formData changes
  useEffect(() => {
    // Only setup autosave for existing resources
    if (!resource?.id) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for autosave (2 seconds after last change)
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 2000);

    // Cleanup
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, autoSave, resource?.id]);

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

    if (formData.categories.length === 0) {
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
        categories: formData.categories, // Only send the array
        type: isBusinessOpportunity ? 'business_opportunity' : 'resource'
      };

      if (resource?.id) {
        // Updates always go to main table regardless of role
        const { error } = await supabase
          .from("resources")
          .update(dataToSave)
          .eq("id", resource.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Resource updated successfully",
        });
        
        // Don't call onSave() or onClose() - keep form open for multiple edits
        // User can click Cancel to go back to the list
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
          <div className="flex flex-col gap-1">
            <CardTitle>
              {resource 
                ? (isBusinessOpportunity ? "Edit Business Opportunity" : "Edit Resource")
                : (isBusinessOpportunity ? "Create New Business Opportunity" : "Create New Resource")
              }
            </CardTitle>
            {resource?.id && (
              <div className="text-sm text-muted-foreground">
                {autoSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    Saving...
                  </span>
                ) : lastSaved ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    Saved {new Date(lastSaved).toLocaleTimeString()}
                  </span>
                ) : (
                  <span>Autosave enabled</span>
                )}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="organization_name">Organization Name *</Label>
              <Input
                id="organization_name"
                value={formData.organization_name}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, organization_name: e.target.value }))
                }
                placeholder="Enter organization name"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, description: e.target.value }))
                }
                placeholder="Enter description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, phone: e.target.value }))
                }
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, email: e.target.value }))
                }
                placeholder="contact@organization.com"
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
              <Label>Cover Photo</Label>
              <div className="space-y-4">
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
                  type="file"
                  accept="image/*"
                  onChange={handleCoverFileSelect}
                  className="hidden"
                />

                <p className="text-xs text-muted-foreground">
                  Upload a cover photo that will appear at the top of the resource card (max 5MB)
                </p>
              </div>
            </div>

            <div>
              <Label>Organization Logo</Label>
              <div className="space-y-4">
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
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileSelect}
                  className="hidden"
                />

                <p className="text-xs text-muted-foreground">
                  Upload a logo that will appear next to the organization name (max 5MB)
                </p>
              </div>
            </div>

            <div>
              <Label>Category *</Label>
              <Select 
                value={formData.category || ""} 
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="mt-2">
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

            <div className="flex gap-2 pt-4">
              {!resource?.id && (
                <Button type="submit" disabled={loading || uploadingLogo || uploadingCover || removingBackgroundLogo || removingBackgroundCover}>
                  {loading || uploadingLogo || uploadingCover
                    ? "Creating..." 
                    : "Create Resource"
                  }
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onClose} disabled={loading || uploadingLogo || uploadingCover || removingBackgroundLogo || removingBackgroundCover}>
                {resource?.id ? "Close" : "Cancel"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}