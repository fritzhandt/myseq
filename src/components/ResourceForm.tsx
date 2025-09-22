import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";

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
  "recreational"
];

export default function ResourceForm({ resource, onClose, onSave }: ResourceFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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
      if (resource?.id) {
        // Update existing resource
        const { error } = await supabase
          .from("resources")
          .update(formData)
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
          .insert([formData]);

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
              <Label htmlFor="logo_url">Logo/Cover Image URL</Label>
              <Input
                id="logo_url"
                type="url"
                value={formData.logo_url}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, logo_url: e.target.value }))
                }
                placeholder="https://example.com/logo.jpg"
              />
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
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : resource ? "Update Resource" : "Create Resource"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}