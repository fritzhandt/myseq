import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ExternalLink, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Resource {
  id: string;
  organization_name: string;
  description: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  logo_url?: string;
  categories: string[];
  created_at: string;
}

interface ResourcesListProps {
  onEdit: (resource: Resource) => void;
}

export default function ResourcesList({ onEdit }: ResourcesListProps) {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast({
        title: "Error",
        description: "Failed to fetch resources",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      const { error } = await supabase
        .from("resources")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Resource deleted successfully",
      });
      
      fetchResources();
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast({
        title: "Error",
        description: "Failed to delete resource",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading resources...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {resources.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No resources found. Create your first resource to get started.
        </div>
      ) : (
        resources.map((resource) => (
          <Card key={resource.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="flex-1">
                <CardTitle className="text-lg">{resource.organization_name}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {resource.categories.map((category) => (
                    <Badge key={category} variant="secondary" className="capitalize">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              {resource.logo_url && (
                <img
                  src={resource.logo_url}
                  alt={`${resource.organization_name} logo`}
                  className="w-16 h-16 object-cover rounded-md"
                />
              )}
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{resource.description}</p>
              
              {/* Contact Information */}
              {(resource.phone || resource.email || resource.address) && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Information
                  </h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {resource.phone && (
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-2" />
                        <a href={`tel:${resource.phone}`} className="hover:text-primary">
                          {resource.phone}
                        </a>
                      </div>
                    )}
                    {resource.email && (
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-2" />
                        <a href={`mailto:${resource.email}`} className="hover:text-primary">
                          {resource.email}
                        </a>
                      </div>
                    )}
                    {resource.address && (
                      <div className="flex items-start">
                        <span className="h-3 w-3 mr-2 mt-0.5 text-muted-foreground">📍</span>
                        <span>{resource.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {resource.website && (
                <div className="mb-4">
                  <a
                    href={resource.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Website
                  </a>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(resource)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(resource.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}