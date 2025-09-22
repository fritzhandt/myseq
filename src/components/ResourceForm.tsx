import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
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
  categories: string[];
}

interface ResourceFormProps {
  resource?: Resource;
  onClose: () => void;
  onSave: () => void;
}

const CATEGORIES = [
  "sports",
  "mental health", 
  "arts",
  "business",
  "recreational",
  "wellness"
];

export default function ResourceForm({ resource, onClose, onSave }: ResourceFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [removingBackground, setRemovingBackground] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(resource?.logo_url || null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Resource>({
    organization_name: resource?.organization_name || "",
    description: resource?.description || "",
    phone: resource?.phone || "",
    email: resource?.email || "",
    address: resource?.address || "",
    website: resource?.website || "",
    logo_url: resource?.logo_url || "",
    categories: resource?.categories || [],
  });

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, category]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        categories: prev.categories.filter(c => c !== category)
      }));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
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

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
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

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;

    setRemovingBackground(true);
    try {
      const imageElement = await loadImage(selectedFile);
      const processedBlob = await removeBackground(imageElement);
      
      // Create a new file from the processed blob
      const processedFile = new File([processedBlob], selectedFile.name, {
        type: 'image/png'
      });
      
      setSelectedFile(processedFile);
      const url = URL.createObjectURL(processedBlob);
      setPreviewUrl(url);
      
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
      setRemovingBackground(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData(prev => ({ ...prev, logo_url: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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

      // Upload image if a new file is selected
      if (selectedFile) {
        setUploadingImage(true);
        logoUrl = await uploadImage(selectedFile);
      }

      const dataToSave = {
        ...formData,
        logo_url: logoUrl
      };

      if (resource?.id) {
        // Update existing resource
        const { error } = await supabase
          .from("resources")
          .update(dataToSave)
          .eq("id", resource.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Resource updated successfully",
        });
      } else {
        // Create new resource
        const { error } = await supabase
          .from("resources")
          .insert([dataToSave]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Resource created successfully",
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving resource:", error);
      toast({
        title: "Error",
        description: "Failed to save resource",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {resource ? "Edit Resource" : "Create New Resource"}
          </CardTitle>
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
              <Label>Logo/Cover Image</Label>
              <div className="space-y-4">
                {/* Image Preview */}
                {previewUrl && (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Logo preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Drag and Drop Zone */}
                {!previewUrl && (
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                      isDragOver 
                        ? "border-primary bg-primary/5" 
                        : "border-muted-foreground/25 hover:border-muted-foreground/50"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">
                      {isDragOver ? "Drop image here" : "Drag and drop an image"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse files
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingImage}
                    >
                      Choose File
                    </Button>
                  </div>
                )}

                {/* Upload Controls for existing image */}
                {previewUrl && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Change Image
                    </Button>

                    {selectedFile && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveBackground}
                        disabled={removingBackground}
                      >
                        <Wand2 className="h-4 w-4 mr-2" />
                        {removingBackground ? "Processing..." : "Remove Background"}
                      </Button>
                    )}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <p className="text-xs text-muted-foreground">
                  Upload an image file (max 5MB). Supported formats: JPG, PNG, WEBP
                </p>
              </div>
            </div>

            <div>
              <Label>Categories *</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={formData.categories.includes(category)}
                      onCheckedChange={(checked) =>
                        handleCategoryChange(category, checked as boolean)
                      }
                    />
                    <Label htmlFor={category} className="capitalize">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading || uploadingImage || removingBackground}>
                {loading || uploadingImage 
                  ? "Saving..." 
                  : resource 
                    ? "Update Resource" 
                    : "Create Resource"
                }
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading || uploadingImage || removingBackground}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}