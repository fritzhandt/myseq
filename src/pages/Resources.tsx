import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, ArrowLeft, ChevronDown, Palette, GraduationCap, Heart, Users, Trophy, Leaf, Scale, Globe, UtensilsCrossed, Gavel, Baby, X, Sparkles, Plus, Map, Grid3x3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PublicResourceSubmissionForm from "@/components/PublicResourceSubmissionForm";
import SkipLinks from "@/components/SkipLinks";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ResourceCard from "@/components/ResourceCard";
import ResourceMap from "@/components/ResourceMap";
import UserPagination from "@/components/UserPagination";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAnalytics } from "@/hooks/useAnalytics";
import { filterWithBooleanSearch } from "@/utils/booleanSearch";

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
  latitude?: number;
  longitude?: number;
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
  { name: "Environmental", icon: Leaf },
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
  const [fromAINavigation, setFromAINavigation] = useState(false);
  const [showAIBadge, setShowAIBadge] = useState(false);
  const [actualSearchQuery, setActualSearchQuery] = useState("");
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const itemsPerPage = 12;
  const location = useLocation();
  const navigate = useNavigate();
  const { trackPageView } = useAnalytics();

  // Set document title
  useEffect(() => {
    document.title = "Programs & Services - My SEQ";
  }, []);

  // Track page view
  useEffect(() => {
    trackPageView('/resources');
  }, [trackPageView]);

  // Handle AI navigation state 
  useEffect(() => {
    const state = location.state as any;
    if (state?.searchTerm || state?.category) {
      // Mark that this came from AI navigation
      setFromAINavigation(true);
      
      // Set search parameters immediately
      if (state.searchTerm) {
        setActualSearchQuery(state.searchTerm);
        setSearchQuery(state.searchTerm);
        setShowAIBadge(true);
      }
      if (state.category) {
        setSelectedCategory(state.category);
        // Show community subcategories if the category is in that section
        if (COMMUNITY_SUBCATEGORIES.some(s => s.name === state.category)) {
          setShowCommunitySubcategories(true);
        }
      }
      
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
    let hadCategoryFilter = false;

    // Filter by category first
    if (selectedCategory) {
      hadCategoryFilter = true;
      filtered = filtered.filter(resource =>
        resource.categories.includes(selectedCategory)
      );
    }

    // Filter by search query with boolean support
    if (searchQuery.trim()) {
      filtered = filterWithBooleanSearch(
        filtered,
        searchQuery,
        (resource) => [
          resource.organization_name,
          resource.description,
          ...resource.categories
        ]
      );
    }

    // Auto-switch to "All Categories" only if AI selected BOTH category AND search term and got no results
    if (fromAINavigation && hadCategoryFilter && filtered.length === 0 && selectedCategory && searchQuery.trim()) {
      console.log("AI navigation: clearing category due to no results with both category and search term");
      setSelectedCategory("");
      setFromAINavigation(false);
      // Will trigger re-filter via useEffect
      return;
    }

    // If this was from AI navigation and we have results, clear the flag
    if (fromAINavigation && filtered.length > 0) {
      setFromAINavigation(false);
    } else if (fromAINavigation && filtered.length === 0) {
      setFromAINavigation(false);
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
    // Hide AI badge when user starts typing
    if (showAIBadge) {
      setShowAIBadge(false);
      setActualSearchQuery("");
    }
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
    <>
      <SkipLinks />
      <header id="primary-navigation">
        <Navbar />
      </header>
      
      <main id="main-content" className="min-h-screen bg-background">
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
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Programs & Services
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover local organizations and services available in your community
          </p>
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
              {showAIBadge ? (
                <div className="flex items-center h-[50px] px-10 border border-primary/20 rounded-md bg-background">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full animate-pulse shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">AI Results</span>
                    <button
                      onClick={() => {
                        setShowAIBadge(false);
                        setSearchQuery("");
                        setActualSearchQuery("");
                      }}
                      className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-primary" />
                    </button>
                  </div>
                </div>
              ) : (
                <Input
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Search resources..."
                  className="pl-10 pr-4 py-3 text-base"
                />
              )}
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

        {/* Live region for search results */}
        <div 
          role="status" 
          aria-live="polite" 
          aria-atomic="true"
          className="sr-only"
        >
          {loading ? 'Loading resources...' : `${filteredResources.length} resources found`}
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-6">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "map")} className="w-auto">
            <TabsList>
              <TabsTrigger value="grid" className="flex items-center gap-2">
                <Grid3x3 className="h-4 w-4" />
                Grid View
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Map View
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Resources Display */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">
              Loading resources...
            </div>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No resources found, try selecting All Categories or changing your search parameters.
            </p>
            {(searchQuery || selectedCategory) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                  setShowAIBadge(false);
                  setActualSearchQuery("");
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <>
                <div 
                  role="region" 
                  aria-label="Resources search results"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
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
            ) : (
              <ResourceMap resources={filteredResources} />
            )}
            
            {/* Submit Form Button */}
            <div className="mt-12 text-center">
              <Button
                size="lg"
                onClick={() => setShowSubmitForm(true)}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="h-5 w-5" />
                Add Your Organization
              </Button>
            </div>
          </>
        )}
      </div>
      </main>
      
      <PublicResourceSubmissionForm 
        open={showSubmitForm} 
        onOpenChange={setShowSubmitForm}
      />
      
      <Footer />
    </>
  );
}