import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import ResourceCard from "@/components/ResourceCard";
import UserPagination from "@/components/UserPagination";
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
  cover_photo_url?: string;
  categories: string[];
}

const CATEGORIES = [
  "sports",
  "mental health", 
  "arts",
  "business",
  "recreational",
  "wellness",
  "legal services"
];

export default function Resources() {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const location = useLocation();
  const navigate = useNavigate();

  // Handle AI navigation state
  useEffect(() => {
    const state = location.state as any;
    if (state) {
      if (state.searchTerm) {
        setSearchQuery(state.searchTerm);
      }
      if (state.category) {
        setSelectedCategory(state.category);
      }
      // Clear the navigation state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("organization_name");

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

  const filterResources = () => {
    let filtered = resources;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(resource =>
        resource.categories.includes(selectedCategory)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(resource =>
        resource.organization_name.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query) ||
        resource.categories.some(category => category.toLowerCase().includes(query))
      );
    }

    setFilteredResources(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(selectedCategory === category ? "" : category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchQuery, selectedCategory]);

  // Paginate filtered resources
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResources = filteredResources.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Back to Home Button */}
      <div className="bg-muted/50 border-b">
        <div className="container mx-auto px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/'}
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Main Menu
          </Button>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4">Community Resources</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover local organizations and services available in your community
            </p>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <Button
            variant={!selectedCategory ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("")}
          >
            All Categories
          </Button>
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategorySelect(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search resources by name, description, or category..."
              className="pl-10 pr-4 py-3 text-base"
            />
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading resources...</div>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No resources found.</p>
            {(searchQuery || selectedCategory) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
            
            {/* Pagination */}
            <UserPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredResources.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </main>
    </div>
  );
}