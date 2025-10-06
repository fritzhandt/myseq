import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ExternalLink, Phone, Mail, Search, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import AdminPagination from "./AdminPagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserRole } from "@/hooks/useUserRole";
import * as XLSX from 'xlsx';

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

interface Resource {
  id: string;
  organization_name: string;
  description: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  logo_url?: string;
  cover_photo_url?: string;
  categories: string[];
  created_at: string;
}

interface ResourcesListProps {
  onEdit: (resource: Resource) => void;
  isBusinessOpportunity?: boolean;
  refreshTrigger?: number;
}

export default function ResourcesList({ onEdit, isBusinessOpportunity = false, refreshTrigger = 0 }: ResourcesListProps) {
  const { toast } = useToast();
  const { isSubAdmin, isMainAdmin } = useUserRole();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const itemsPerPage = 10;

  const fetchResources = async () => {
    try {
      const resourceType = isBusinessOpportunity ? 'business_opportunity' : 'resource';
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq('type', resourceType)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources(data || []);
      setFilteredResources(data || []);
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

  // Filter resources based on search term
  useEffect(() => {
    const filtered = resources.filter((resource) =>
      resource.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (!isBusinessOpportunity && resource.categories.some(category => 
        category.toLowerCase().includes(searchTerm.toLowerCase())
      )) ||
      (resource.email && resource.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (resource.phone && resource.phone.includes(searchTerm))
    );
    setFilteredResources(filtered);
  }, [searchTerm, resources, isBusinessOpportunity]);

  // Reset to first page only when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Paginate filtered resources
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResources = filteredResources.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Sub-admins create pending modification request
      if (isSubAdmin) {
        const resource = resources.find(r => r.id === id);
        if (!resource) throw new Error('Resource not found');

        // Fetch profile info
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name, phone_number')
          .eq('user_id', user.id)
          .maybeSingle();

        const { error } = await supabase
          .from("pending_resource_modifications")
          .insert({
            resource_id: id,
            action: 'delete',
            modified_data: resource,
            submitted_by: user.id,
            submitter_name: profile?.full_name || null,
            submitter_phone: profile?.phone_number || null
          });

        if (error) throw error;

        toast({
          title: "Request Submitted",
          description: "Your delete request has been submitted for approval",
        });
      } else {
        // Main admins delete directly
        const { error } = await supabase
          .from("resources")
          .delete()
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Resource deleted successfully",
        });
      }
      
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

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedResources.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedResources.map(r => r.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDownloadCSV = () => {
    // Prepare data for export
    const exportData = resources.map(resource => ({
      id: resource.id,
      organization_name: resource.organization_name,
      description: resource.description,
      categories: resource.categories.join(', '),
      website: resource.website || '',
      email: resource.email || '',
      phone: resource.phone || '',
      address: resource.address || '',
      type: isBusinessOpportunity ? 'business_opportunity' : 'resource',
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, isBusinessOpportunity ? 'Business Opportunities' : 'Resources');

    // Generate file name with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${isBusinessOpportunity ? 'business_opportunities' : 'resources'}_${timestamp}.xlsx`;

    // Download
    XLSX.writeFile(workbook, filename);
    
    toast({
      title: "Download Complete",
      description: `Downloaded ${resources.length} ${isBusinessOpportunity ? 'business opportunities' : 'programs/services'}`,
    });
  };

  const handleBulkCategoryUpdate = async () => {
    if (!bulkCategory || selectedIds.size === 0) {
      toast({
        title: "Error",
        description: "Please select a category and at least one organization",
        variant: "destructive",
      });
      return;
    }

    setBulkUpdating(true);

    try {
      const updatePromises = Array.from(selectedIds).map(id =>
        supabase
          .from("resources")
          .update({ categories: [bulkCategory], updated_at: new Date().toISOString() })
          .eq("id", id)
      );

      const results = await Promise.all(updatePromises);
      const errors = results.filter(r => r.error);

      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} organizations`);
      }

      toast({
        title: "Success",
        description: `Updated ${selectedIds.size} organization(s) to ${bulkCategory} category`,
      });

      setSelectedIds(new Set());
      setBulkCategory("");
      fetchResources();
    } catch (error) {
      console.error("Error bulk updating:", error);
      toast({
        title: "Error",
        description: "Failed to update some organizations",
        variant: "destructive",
      });
    } finally {
      setBulkUpdating(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [isBusinessOpportunity, refreshTrigger]); // Fetch when switching types or when refreshTrigger changes

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading resources...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar - Only show for resources, not business opportunities */}
      {!isBusinessOpportunity && selectedIds.size > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedIds.size} selected
              </span>
              <Select value={bulkCategory} onValueChange={setBulkCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Change category to..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleBulkCategoryUpdate}
                disabled={!bulkCategory || bulkUpdating}
                size="sm"
              >
                {bulkUpdating ? "Updating..." : "Update Categories"}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setSelectedIds(new Set())}
                size="sm"
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Bar and Download Button */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search resources by name, description, category, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleDownloadCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download CSV
        </Button>
      </div>

      {/* Results Summary */}
      {searchTerm && (
        <div className="text-sm text-muted-foreground">
          {filteredResources.length === 0 
            ? `No resources found for "${searchTerm}"`
            : `Found ${filteredResources.length} resource${filteredResources.length === 1 ? '' : 's'} for "${searchTerm}"`
          }
        </div>
      )}
      
      {filteredResources.length === 0 && !searchTerm ? (
        <div className="text-center py-8 text-muted-foreground">
          No resources found. Create your first resource to get started.
        </div>
      ) : filteredResources.length === 0 && searchTerm ? (
        <div className="text-center py-8 text-muted-foreground">
          No resources match your search criteria.
        </div>
      ) : (
        <>
          {/* Select All Checkbox - Hide for business opportunities */}
          {!isBusinessOpportunity && paginatedResources.length > 0 && (
            <div className="flex items-center gap-2 px-2 py-2 border-b">
              <Checkbox
                checked={selectedIds.size === paginatedResources.length && paginatedResources.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Select all on this page
              </span>
            </div>
          )}

          {paginatedResources.map((resource) => (
          <Card key={resource.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="flex items-start gap-3 flex-1">
                {!isBusinessOpportunity && (
                  <Checkbox
                    checked={selectedIds.has(resource.id)}
                    onCheckedChange={() => toggleSelect(resource.id)}
                    className="mt-1"
                  />
                )}
                <div className="flex-1">
                  <CardTitle className="text-lg">{resource.organization_name}</CardTitle>
                  {!isBusinessOpportunity && resource.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {resource.categories.map((category) => (
                        <Badge key={category} variant="secondary" className="capitalize">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  )}
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
                  {isSubAdmin ? 'Request Delete' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
          ))
        }
        
        {/* Pagination */}
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredResources.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </>
      )}
    </div>
  );
}