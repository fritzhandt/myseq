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
import { TranslatedText } from "@/components/TranslatedText";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useTranslation } from "@/contexts/TranslationContext";

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
  "environment",
  "youth",
  "community resources",
  "sports",
  "mental health/wellness", 
  "arts",
  "recreational",
  "conflict management",
  "legal services",
  "educational",
  "senior services"
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
  const { trackPageView } = useAnalytics();
  const { currentLanguage } = useTranslation();

  // Track page view
  useEffect(() => {
    trackPageView('/resources', undefined, currentLanguage);
  }, []);

  // Handle AI navigation state 
  useEffect(() => {
    const state = location.state as any;
    if (state?.searchTerm || state?.category) {
      // Set search parameters immediately
      if (state.searchTerm) setSearchQuery(state.searchTerm);
      if (state.category) setSelectedCategory(state.category);
      
      // Clear navigation state immediately
      navigate(location.pathname, { replace: true });
      
      // Trigger immediate filter after state is set
      setTimeout(() => {
        filterResources();
      }, 0);
    }
  }, [location.state, navigate, location.pathname]);

  // Auto-trigger filter when search query or category changes
  useEffect(() => {
    if (resources.length > 0) {
      filterResources();
    }
  }, [searchQuery, selectedCategory, resources]);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq('type', 'resource')
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

  const handleSearch = () => {
    filterResources();
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(selectedCategory === category ? "" : category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      // Only auto-filter when there's no search query
      filterResources();
    }
  }, [resources, selectedCategory]);

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
            <TranslatedText contentKey="resources-back-btn" originalText="Back to Main Menu" />
          </Button>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4">
              <TranslatedText contentKey="resources-title" originalText="Programs & Services" />
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              <TranslatedText 
                contentKey="resources-subtitle" 
                originalText="Discover local organizations and services available in your community" 
              />
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
            <TranslatedText contentKey="resources-all-categories" originalText="All Categories" />
          </Button>
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategorySelect(category)}
              className="capitalize"
            >
              <TranslatedText 
                contentKey={`category-${category.replace(/\s+/g, '-')}`} 
                originalText={category} 
              />
            </Button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
                placeholder="Search resources..."
                className="pl-10 pr-4 py-3 text-base"
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={loading}
              className="shrink-0 px-6"
            >
              <TranslatedText 
                contentKey="resources-search-btn" 
                originalText={loading ? 'Searching...' : 'Search'} 
              />
            </Button>
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">
              <TranslatedText contentKey="resources-loading" originalText="Loading resources..." />
            </div>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              <TranslatedText contentKey="resources-no-results" originalText="No resources found." />
            </p>
            {(searchQuery || selectedCategory) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                }}
                className="mt-4"
              >
                <TranslatedText contentKey="resources-clear-filters" originalText="Clear Filters" />
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