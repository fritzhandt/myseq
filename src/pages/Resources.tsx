import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, ArrowLeft, ChevronDown, Palette, GraduationCap, Heart, Users, Trophy, Leaf, Scale, Globe, UtensilsCrossed, Gavel, Baby } from "lucide-react";
import Navbar from "@/components/Navbar";
import ResourceCard from "@/components/ResourceCard";
import UserPagination from "@/components/UserPagination";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAnalytics } from "@/hooks/useAnalytics";
import { translateSearchQuery } from "@/utils/translateSearch";

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

// Main categories with icons
const MAIN_CATEGORIES = [
  { name: "Arts", icon: Palette },
  { name: "Educational", icon: GraduationCap },
  { name: "Mental Health/Wellness", icon: Heart },
  { name: "Senior Services", icon: Users },
  { name: "Social", icon: Users },
  { name: "Sports", icon: Trophy }
];

// Community Resources subcategories with icons
const COMMUNITY_SUBCATEGORIES = [
  { name: "Environment", icon: Leaf },
  { name: "Conflict Management", icon: Scale },
  { name: "Cultural", icon: Globe },
  { name: "Food", icon: UtensilsCrossed },
  { name: "Legal Services", icon: Gavel },
  { name: "Youth", icon: Baby }
];

export default function Resources() {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showCommunitySubcategories, setShowCommunitySubcategories] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const location = useLocation();
  const navigate = useNavigate();
  const { trackPageView } = useAnalytics();

  // Track page view
  useEffect(() => {
    trackPageView('/resources');
  }, [trackPageView]);

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

  const filterResources = async () => {
    let filtered = resources;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(resource =>
        resource.categories.includes(selectedCategory)
      );
    }

    // Filter by search query with translation
    if (searchQuery.trim()) {
      setLoading(true);
      try {
        // Translate the query to English if needed
        const searchTerms = await translateSearchQuery(searchQuery);
        
        filtered = filtered.filter(resource => {
          // Check against all search terms (original + translated)
          return searchTerms.some(term => {
            const query = term.toLowerCase();
            return (
              resource.organization_name.toLowerCase().includes(query) ||
              resource.description.toLowerCase().includes(query) ||
              resource.categories.some(category => category.toLowerCase().includes(query))
            );
          });
        });
      } catch (error) {
        console.error('Translation error:', error);
        // Fallback to original search if translation fails
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(resource =>
          resource.organization_name.toLowerCase().includes(query) ||
          resource.description.toLowerCase().includes(query) ||
          resource.categories.some(category => category.toLowerCase().includes(query))
        );
      } finally {
        setLoading(false);
      }
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
            Back to Main Menu
          </Button>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4">
              Programs & Services
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover local organizations and services available in your community
            </p>
          </div>
        </div>

        {/* Category Filter Navigation */}
        <Card className="max-w-6xl mx-auto mb-8 p-6 shadow-lg">
          <div className="space-y-6">
            {/* All Categories Button */}
            <div className="flex justify-center">
              <Button
                variant={!selectedCategory ? "default" : "outline"}
                size="lg"
                onClick={() => {
                  setSelectedCategory("");
                  setShowCommunitySubcategories(false);
                }}
                className="min-w-[180px]"
              >
                All Categories
              </Button>
            </div>

            {/* Main Categories Grid */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 text-center">
                Categories
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {MAIN_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.name}
                      variant={selectedCategory === category.name ? "default" : "outline"}
                      size="lg"
                      onClick={() => {
                        handleCategorySelect(category.name);
                        setShowCommunitySubcategories(false);
                      }}
                      className="h-auto py-4 flex flex-col items-center gap-2"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs text-center leading-tight">
                        {category.name}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Community Resources Section */}
            <div className="border-t pt-6">
              <Button
                variant={COMMUNITY_SUBCATEGORIES.some(s => s.name === selectedCategory) || showCommunitySubcategories ? "default" : "outline"}
                size="lg"
                onClick={() => {
                  setShowCommunitySubcategories(!showCommunitySubcategories);
                  if (!showCommunitySubcategories) {
                    setSelectedCategory("");
                  }
                }}
                className="w-full md:w-auto min-w-[240px] mx-auto flex items-center justify-center gap-2"
              >
                <Users className="h-5 w-5" />
                More Resource Categories
                <ChevronDown className={`h-4 w-4 transition-transform ${showCommunitySubcategories ? 'rotate-180' : ''}`} />
              </Button>
              
              {/* Subcategories Grid */}
              {showCommunitySubcategories && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  {COMMUNITY_SUBCATEGORIES.map((subcategory) => {
                    const Icon = subcategory.icon;
                    return (
                      <Button
                        key={subcategory.name}
                        variant={selectedCategory === subcategory.name ? "default" : "outline"}
                        size="lg"
                        onClick={() => handleCategorySelect(subcategory.name)}
                        className="h-auto py-4 flex flex-col items-center gap-2"
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs text-center leading-tight">
                          {subcategory.name}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Card>

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
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">
              Loading resources...
            </div>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No resources found.
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