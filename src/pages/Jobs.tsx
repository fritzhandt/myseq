import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import CommunityAlertBanner from '@/components/CommunityAlertBanner';
import JobList from '@/components/JobList';
import UserPagination from '@/components/UserPagination';
import SearchableEmployerDropdown from '@/components/SearchableEmployerDropdown';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, MapPin, Building, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useIsMobile } from '@/hooks/use-mobile';
import { filterWithBooleanSearch } from '@/utils/booleanSearch';

interface Job {
  id: string;
  employer: string;
  title: string;
  location: string;
  salary: string;
  apply_info: string;
  description: string;
  is_apply_link: boolean;
  created_at: string;
  category: string;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [employerFilter, setEmployerFilter] = useState('all');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('government');
  const [governmentFilter, setGovernmentFilter] = useState<'all' | 'city' | 'state'>('all');
  const [isAIPopulated, setIsAIPopulated] = useState(false);
  const itemsPerPage = 10;
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackPageView } = useAnalytics();
  const isMobile = useIsMobile();

  const MAX_JOB_SEARCH_LENGTH = 100;

  // Track page view
  useEffect(() => {
    trackPageView('/jobs');
  }, [trackPageView]);

  // Handle AI navigation state
  useEffect(() => {
    const state = location.state as any;
    if ((state?.searchTerm || state?.employer || state?.location || state?.category || state?.governmentType) && jobs.length > 0 && !loading) {
      // Set parameters
      if (state.searchTerm) setSearchQuery(state.searchTerm);
      if (state.employer) setEmployerFilter(state.employer);
      if (state.location) setLocationFilter(state.location);
      
      // Handle category (government/private_sector)
      if (state.category) {
        setActiveTab(state.category);
      }
      
      // Handle government type (city/state)
      if (state.governmentType && state.category === 'government') {
        setGovernmentFilter(state.governmentType);
      }
      
      // Auto-expand advanced search on mobile if location or employer filters are set
      if (isMobile && (state.employer || state.location)) {
        setShowAdvancedSearch(true);
      }
      
      // Mark as AI populated for visual indicator
      setIsAIPopulated(true);
      
      // Clear the navigation state
      navigate(location.pathname, { replace: true });
      
      // Filters will apply automatically via useEffect on line 103
      // Show confirmation toast after a brief delay to let filters apply
      setTimeout(() => {
        toast({
          title: "AI Search Complete",
          description: "Your job search results are ready below",
        });
        setTimeout(() => setIsAIPopulated(false), 3000);
      }, 500);
    }
  }, [location.state, navigate, location.pathname, jobs, loading, isMobile, toast]);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    // Apply filters automatically when parameters change
    if (jobs.length > 0) {
      applyFilters();
    }
  }, [jobs, searchQuery, locationFilter, employerFilter, activeTab, governmentFilter]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...jobs];

    // Filter by category (government/private/internships)
    if (activeTab === 'government') {
      filtered = filtered.filter(job => job.category === 'government');
      
      // Filter by government type (city/state)
      if (governmentFilter !== 'all') {
        filtered = filtered.filter(job => {
          const subcategory = (job as any).subcategory || 'city';
          return subcategory === governmentFilter;
        });
      }
    } else if (activeTab === 'private_sector') {
      filtered = filtered.filter(job => job.category === 'private_sector');
    } else if (activeTab === 'internships') {
      filtered = filtered.filter(job => job.category === 'internships');
    }

    // Filter by search query with boolean support
    if (searchQuery.trim()) {
      filtered = filterWithBooleanSearch(
        filtered,
        searchQuery,
        (job) => [
          job.title,
          job.description,
          job.employer,
          job.location
        ]
      );
    }

    // Filter by location
    if (locationFilter && locationFilter !== 'all') {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Filter by employer
    if (employerFilter && employerFilter !== 'all') {
      filtered = filtered.filter(job =>
        job.employer.toLowerCase().includes(employerFilter.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [jobs, searchQuery, locationFilter, employerFilter, activeTab, governmentFilter]);

  const handleManualSearch = useCallback(() => {
    applyFilters();
  }, [applyFilters]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualSearch();
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocationFilter('all');
    setEmployerFilter('all');
    setGovernmentFilter('all');
    // Auto-apply filters after clearing
    setTimeout(() => {
      applyFilters();
    }, 0);
  };

  const filteredByCategory = jobs.filter(job => {
    if (activeTab === 'government') {
      if (job.category !== 'government') return false;
      if (governmentFilter !== 'all') {
        const subcategory = (job as any).subcategory || 'city';
        return subcategory === governmentFilter;
      }
      return true;
    } else if (activeTab === 'private_sector') {
      return job.category === 'private_sector';
    } else if (activeTab === 'internships') {
      return job.category === 'internships';
    }
    return false;
  });
  
  const uniqueLocations = [...new Set(filteredByCategory.map(job => job.location))];
  const uniqueEmployers = [...new Set(filteredByCategory.map(job => job.employer))];

  // Paginate filtered jobs
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CommunityAlertBanner />
      
      {/* Back to Main Menu */}
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

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Next{' '}
            <span className="text-primary">Opportunity</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover job opportunities in your community and take the next step in your career
          </p>
        </div>

        {/* Search and Filters */}
        <div className="w-full">
          <div className="flex flex-col items-center mb-8">
            <p className="text-sm font-medium text-muted-foreground mb-3 text-center">Select a category first!</p>
            <div className="relative w-full max-w-2xl px-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 via-primary/60 to-primary/40 blur-xl rounded-2xl opacity-70"></div>
              <div className="relative grid w-full grid-cols-3 bg-card border-2 border-primary/30 rounded-xl p-1.5 shadow-lg">
                <button
                  onClick={() => setActiveTab('government')}
                  className={`px-2 sm:px-4 md:px-6 py-2.5 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 ${
                    activeTab === 'government'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  Government
                </button>
                <button
                  onClick={() => setActiveTab('private_sector')}
                  className={`px-2 sm:px-4 md:px-6 py-2.5 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 ${
                    activeTab === 'private_sector'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <span className="hidden sm:inline">Private Sector</span>
                  <span className="sm:hidden">Private</span>
                </button>
                <button
                  onClick={() => setActiveTab('internships')}
                  className={`px-2 sm:px-4 md:px-6 py-2.5 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 ${
                    activeTab === 'internships'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  Internships
                </button>
              </div>
            </div>
          </div>

          {activeTab === 'government' && (
            <Card className="mb-8">
              <CardContent className="p-6">
                 {/* Always visible: Job Title Search */}
                 <div className="space-y-4">
                    {/* Government Type Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Government Type
                      </label>
                      <div className="flex gap-2">
                        <Button
                          variant={governmentFilter === 'all' ? 'default' : 'outline'}
                          onClick={() => setGovernmentFilter('all')}
                          className="flex-1"
                        >
                          All
                        </Button>
                        <Button
                          variant={governmentFilter === 'city' ? 'default' : 'outline'}
                          onClick={() => setGovernmentFilter('city')}
                          className="flex-1"
                        >
                          City
                        </Button>
                        <Button
                          variant={governmentFilter === 'state' ? 'default' : 'outline'}
                          onClick={() => setGovernmentFilter('state')}
                          className="flex-1"
                        >
                          State
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Job Title
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search job title..."
                          value={searchQuery}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= MAX_JOB_SEARCH_LENGTH) {
                              setSearchQuery(value);
                            } else {
                              toast({
                                title: "Character limit reached",
                                description: "100 character limit please.",
                                variant: "destructive"
                              });
                            }
                          }}
                          onKeyPress={handleKeyPress}
                          className="flex-1"
                        />
                        <Button 
                          onClick={handleManualSearch}
                          disabled={isSearching}
                          className="shrink-0"
                        >
                          {isSearching ? 'Searching...' : 'Search'}
                        </Button>
                      </div>
                    </div>

                  {/* Advanced Search Toggle Button - only visible on mobile */}
                  <div className="md:hidden">
                    <Button
                      variant="outline"
                      onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      Advanced Search
                      {showAdvancedSearch ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                   {/* Advanced Filters - always visible on desktop, toggleable on mobile */}
                   <div className={`${showAdvancedSearch ? 'block' : 'hidden'} md:block`}>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {/* Location Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Location
                          </label>
                          <Select value={locationFilter} onValueChange={setLocationFilter}>
                            <SelectTrigger className="w-full bg-background">
                              <SelectValue placeholder="All locations">
                                {locationFilter === 'all' ? 'All locations' : locationFilter}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-background z-50">
                              <SelectItem value="all">All locations</SelectItem>
                              {uniqueLocations.map(location => (
                                <SelectItem key={location} value={location}>{location}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Employer Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Employer
                          </label>
                          <SearchableEmployerDropdown
                            employers={uniqueEmployers}
                            value={employerFilter}
                            onChange={setEmployerFilter}
                            placeholder="All employers"
                          />
                        </div>

                        {/* Clear Filters */}
                        <div className="space-y-2 flex items-end">
                          <Button variant="outline" onClick={clearFilters} className="w-full">
                            Clear Filters
                          </Button>
                        </div>
                     </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'private_sector' && (
            <Card className="mb-8">
              <CardContent className="p-6">
                  {/* Always visible: Job Title Search */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Job Title
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search job title..."
                          value={searchQuery}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= MAX_JOB_SEARCH_LENGTH) {
                              setSearchQuery(value);
                            } else {
                              toast({
                                title: "Character limit reached",
                                description: "100 character limit please.",
                                variant: "destructive"
                              });
                            }
                          }}
                          onKeyPress={handleKeyPress}
                          className="flex-1"
                        />
                        <Button 
                          onClick={handleManualSearch}
                          disabled={isSearching}
                          className="shrink-0"
                        >
                          {isSearching ? 'Searching...' : 'Search'}
                        </Button>
                      </div>
                    </div>

                  {/* Advanced Search Toggle Button - only visible on mobile */}
                  <div className="md:hidden">
                    <Button
                      variant="outline"
                      onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      Advanced Search
                      {showAdvancedSearch ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                   {/* Advanced Filters - always visible on desktop, toggleable on mobile */}
                   <div className={`${showAdvancedSearch ? 'block' : 'hidden'} md:block`}>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {/* Location Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Location
                          </label>
                          <Select value={locationFilter} onValueChange={setLocationFilter}>
                            <SelectTrigger className="w-full bg-background">
                              <SelectValue placeholder="All locations">
                                {locationFilter === 'all' ? 'All locations' : locationFilter}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-background z-50">
                              <SelectItem value="all">All locations</SelectItem>
                              {uniqueLocations.map(location => (
                                <SelectItem key={location} value={location}>{location}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Employer Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Employer
                          </label>
                          <SearchableEmployerDropdown
                            employers={uniqueEmployers}
                            value={employerFilter}
                            onChange={setEmployerFilter}
                            placeholder="All employers"
                          />
                        </div>

                        {/* Clear Filters */}
                        <div className="space-y-2 flex items-end">
                          <Button variant="outline" onClick={clearFilters} className="w-full">
                            Clear Filters
                          </Button>
                        </div>
                     </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'internships' && (
            <Card className="mb-8">
              <CardContent className="p-6">
                  {/* Always visible: Job Title Search */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Job Title
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search job title..."
                          value={searchQuery}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= MAX_JOB_SEARCH_LENGTH) {
                              setSearchQuery(value);
                            } else {
                              toast({
                                title: "Character limit reached",
                                description: "100 character limit please.",
                                variant: "destructive"
                              });
                            }
                          }}
                          onKeyPress={handleKeyPress}
                          className="flex-1"
                        />
                        <Button 
                          onClick={handleManualSearch}
                          disabled={isSearching}
                          className="shrink-0"
                        >
                          {isSearching ? 'Searching...' : 'Search'}
                        </Button>
                      </div>
                    </div>

                  {/* Advanced Search Toggle Button - only visible on mobile */}
                  <div className="md:hidden">
                    <Button
                      variant="outline"
                      onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      Advanced Search
                      {showAdvancedSearch ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                   {/* Advanced Filters - always visible on desktop, toggleable on mobile */}
                   <div className={`${showAdvancedSearch ? 'block' : 'hidden'} md:block`}>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {/* Location Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Location
                          </label>
                          <Select value={locationFilter} onValueChange={setLocationFilter}>
                            <SelectTrigger className="w-full bg-background">
                              <SelectValue placeholder="All locations">
                                {locationFilter === 'all' ? 'All locations' : locationFilter}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-background z-50">
                              <SelectItem value="all">All locations</SelectItem>
                              {uniqueLocations.map(location => (
                                <SelectItem key={location} value={location}>{location}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Employer Filter */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Employer
                          </label>
                          <SearchableEmployerDropdown
                            employers={uniqueEmployers}
                            value={employerFilter}
                            onChange={setEmployerFilter}
                            placeholder="All employers"
                          />
                        </div>

                        {/* Clear Filters */}
                        <div className="space-y-2 flex items-end">
                          <Button variant="outline" onClick={clearFilters} className="w-full">
                            Clear Filters
                          </Button>
                        </div>
                     </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
        </div>

        {/* Job List */}
        <div className={isAIPopulated ? 'animate-fade-in' : ''}>
          <JobList jobs={paginatedJobs} loading={loading} isSearching={isSearching} />
        </div>
        
        {/* Pagination */}
        {filteredJobs.length > 0 && (
          <UserPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredJobs.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </main>
    </div>
  );
}