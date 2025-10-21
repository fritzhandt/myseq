import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft, Plus } from "lucide-react";
import PublicBusinessOpportunityForm from '@/components/PublicBusinessOpportunityForm';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SkipLinks from "@/components/SkipLinks";
import ResourceCard from "@/components/ResourceCard";
import UserPagination from "@/components/UserPagination";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAnalytics } from "@/hooks/useAnalytics";
import { filterWithBooleanSearch } from "@/utils/booleanSearch";

interface BusinessOpportunity {
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

export default function BusinessOpportunities() {
  const { toast } = useToast();
  const [opportunities, setOpportunities] = useState<BusinessOpportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<BusinessOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const itemsPerPage = 12;
  const location = useLocation();
  const navigate = useNavigate();
  const { trackPageView } = useAnalytics();

  // Track page view
  useEffect(() => {
    document.title = "Business Opportunities - My SEQ";
    trackPageView('/business-opportunities');
  }, [trackPageView]);

  // Handle AI navigation state 
  useEffect(() => {
    const state = location.state as any;
    if (state?.searchTerm) {
      setSearchQuery(state.searchTerm);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  // Auto-trigger filter when search query changes
  useEffect(() => {
    filterOpportunities();
  }, [searchQuery]);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq('type', 'business_opportunity')
        .order("organization_name");

      if (error) throw error;
      setOpportunities(data || []);
      setFilteredOpportunities(data || []);
    } catch (error) {
      console.error("Error fetching business opportunities:", error);
      toast({
        title: "Error",
        description: "Failed to fetch business opportunities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOpportunities = () => {
    let filtered = opportunities;

    // Filter by search query with boolean support
    if (searchQuery.trim()) {
      filtered = filterWithBooleanSearch(
        filtered,
        searchQuery,
        (opportunity) => [
          opportunity.organization_name,
          opportunity.description,
          ...opportunity.categories
        ]
      );
    }

    setFilteredOpportunities(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = () => {
    filterOpportunities();
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
    fetchOpportunities();
  }, []);

  // Paginate filtered opportunities
  const totalPages = Math.ceil(filteredOpportunities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOpportunities = filteredOpportunities.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <SkipLinks />
      <div className="min-h-screen flex flex-col">
        <header id="primary-navigation">
          <Navbar />
        </header>
        
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
        
        <main id="main-content" className="container mx-auto px-4 py-8 flex-1">
        <div className="text-center mb-8">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4">
              Business Opportunities
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
              Explore business opportunities and entrepreneurship resources in your community
            </p>
            <Button
              size="lg"
              onClick={() => setShowSubmitForm(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Submit Your Opportunity
            </Button>
          </div>
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
                placeholder="Search business opportunities..."
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
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Search finds relevant opportunities. Press Enter or click Search.
          </p>
        </div>

        {/* Live region for search results */}
        <div 
          role="status" 
          aria-live="polite" 
          aria-atomic="true"
          className="sr-only"
        >
          {loading ? 'Loading business opportunities...' : `${filteredOpportunities.length} business opportunities found`}
        </div>

        {/* Opportunities Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">
              Loading business opportunities...
            </div>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No business opportunities found.
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="mt-4"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <>
            <div 
              role="region" 
              aria-label="Business opportunities search results"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {paginatedOpportunities.map((opportunity) => (
                <ResourceCard key={opportunity.id} resource={opportunity} />
              ))}
            </div>
            
            {/* Pagination */}
            <UserPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredOpportunities.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </main>
      <Footer />
      
      <PublicBusinessOpportunityForm
        open={showSubmitForm}
        onOpenChange={setShowSubmitForm}
      />
    </div>
    </>
  );
}