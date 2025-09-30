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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, MapPin, Building, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTranslation } from '@/contexts/TranslationContext';

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
  const [activeTab, setActiveTab] = useState('city');
  const itemsPerPage = 10;
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackPageView } = useAnalytics();
  const { currentLanguage } = useTranslation();

  const MAX_JOB_SEARCH_LENGTH = 100;

  // Track page view
  useEffect(() => {
    trackPageView('/jobs', undefined, currentLanguage);
  }, []);

  // Handle AI navigation state
  useEffect(() => {
    const state = location.state as any;
    if ((state?.searchTerm || state?.employer || state?.location) && jobs.length > 0 && !loading) {
      // Set parameters first
      if (state.searchTerm) setSearchQuery(state.searchTerm);
      if (state.employer) setEmployerFilter(state.employer);
      if (state.location) setLocationFilter(state.location);
      
      // Auto-trigger search after state is set
      const triggerSearch = async () => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Give time for state to update
        
        // Manually trigger the AI search
        setIsSearching(true);
        try {
          console.log('Auto-triggering AI job search from navigation:', state.searchTerm);
          
          const { data, error } = await supabase.functions.invoke('ai-job-search', {
            body: { 
              query: state.searchTerm || '',
              location: state.location !== 'all' ? state.location : undefined,
              employer: state.employer !== 'all' ? state.employer : undefined,
              category: activeTab
            }
          });

          if (error) {
            console.error('AI job search error:', error);
            throw error;
          }

          if (data.success) {
            console.log(`AI auto-search found ${data.jobs.length} matching jobs`);
            setFilteredJobs(data.jobs || []);
            toast({
              title: "Search completed",
              description: `Found ${data.jobs.length} matching jobs for "${state.searchTerm}"`,
            });
          } else {
            console.error('AI job search failed:', data.error);
            // Fallback to basic search
            let filtered = [...jobs];
            if (state.searchTerm) {
              filtered = filtered.filter(job =>
                job.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                job.description.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                job.employer.toLowerCase().includes(state.searchTerm.toLowerCase())
              );
            }
            setFilteredJobs(filtered);
            toast({
              title: "Search completed",
              description: `Found ${filtered.length} matching jobs using basic search`,
            });
          }
        } catch (error) {
          console.error('Auto AI search failed, using fallback:', error);
          // Fallback search
          let filtered = [...jobs];
          if (state.searchTerm) {
            filtered = filtered.filter(job =>
              job.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
              job.description.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
              job.employer.toLowerCase().includes(state.searchTerm.toLowerCase())
            );
          }
          setFilteredJobs(filtered);
          toast({
            title: "Search completed",
            description: `Found ${filtered.length} matching jobs using fallback search`,
          });
        } finally {
          setIsSearching(false);
        }
        
        setCurrentPage(1);
      };
      
      triggerSearch();
      
      // Clear the navigation state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname, activeTab, jobs, loading, toast]);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    // Only apply basic filters automatically, not AI search
    applyBasicFilters();
  }, [jobs, locationFilter, employerFilter, activeTab]);

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

  const applyBasicFilters = useCallback(() => {
    if (searchQuery) {
      // Don't auto-filter when there's a search query - require manual search
      return;
    }
    
    let filtered = [...jobs];

    // Filter by category (city/state)
    filtered = filtered.filter(job => 
      job.category === activeTab || job.category === 'both'
    );

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
  }, [jobs, searchQuery, locationFilter, employerFilter, activeTab]);

  const handleManualSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      // If no search query, just apply basic filters
      applyBasicFilters();
      return;
    }

    setIsSearching(true);
    try {
      console.log('Starting manual AI job search with query:', searchQuery);
      
      const { data, error } = await supabase.functions.invoke('ai-job-search', {
        body: { 
          query: searchQuery,
          location: locationFilter !== 'all' ? locationFilter : undefined,
          employer: employerFilter !== 'all' ? employerFilter : undefined,
          category: activeTab
        }
      });

      if (error) {
        console.error('AI job search error:', error);
        throw error;
      }

      if (data.success) {
        console.log(`AI found ${data.jobs.length} matching jobs`);
        setFilteredJobs(data.jobs || []);
      } else {
        console.error('AI job search failed:', data.error);
        // Fallback to basic search
        fallbackSearch();
      }
    } catch (error) {
      console.error('AI search failed, using fallback:', error);
      fallbackSearch();
    } finally {
      setIsSearching(false);
    }
    
    setCurrentPage(1);
  }, [searchQuery, locationFilter, employerFilter, activeTab, applyBasicFilters]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualSearch();
    }
  };

  const fallbackSearch = () => {
    let filtered = [...jobs];

    // Filter by category (city/state)
    filtered = filtered.filter(job => 
      job.category === activeTab || job.category === 'both'
    );

    // Basic text search across title, description, and employer
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.employer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply other filters
    if (locationFilter && locationFilter !== 'all') {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    if (employerFilter && employerFilter !== 'all') {
      filtered = filtered.filter(job =>
        job.employer.toLowerCase().includes(employerFilter.toLowerCase())
      );
    }
    
    setFilteredJobs(filtered);
  };


  const clearFilters = () => {
    setSearchQuery('');
    setLocationFilter('all');
    setEmployerFilter('all');
    // Auto-apply filters after clearing
    setTimeout(() => {
      applyBasicFilters();
    }, 0);
  };

  const uniqueLocations = [...new Set(jobs.filter(job => job.category === activeTab || job.category === 'both').map(job => job.location))];
  const uniqueEmployers = [...new Set(jobs.filter(job => job.category === activeTab || job.category === 'both').map(job => job.employer))];

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
            <TranslatedText contentKey="jobs.back_to_menu" originalText="Back to Main Menu" />
          </Button>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <TranslatedText contentKey="jobs.title_part1" originalText="Find Your Next" />{' '}
            <span className="text-primary"><TranslatedText contentKey="jobs.title_part2" originalText="Opportunity" /></span>
          </h1>
          <TranslatedText 
            contentKey="jobs.subtitle" 
            originalText="Discover job opportunities in your community and take the next step in your career"
            as="p"
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          />
        </div>

        {/* Search and Filters */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="city"><TranslatedText contentKey="jobs.city_jobs" originalText="City Jobs" /></TabsTrigger>
              <TabsTrigger value="state"><TranslatedText contentKey="jobs.state_jobs" originalText="State Jobs" /></TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="city" className="mt-0">
            <Card className="mb-8">
              <CardContent className="p-6">
                 {/* Always visible: Job Title Search */}
                 <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <TranslatedText contentKey="jobs.job_title_label" originalText="Job Title" />
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search job title using AI"
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
                          <TranslatedText 
                            contentKey="jobs.search_button" 
                            originalText={isSearching ? 'Searching...' : 'Search'}
                          />
                        </Button>
                      </div>
                      <TranslatedText 
                        contentKey="jobs.search_hint" 
                        originalText="Smart search matches similar job titles. Press Enter or click Search."
                        as="p"
                        className="text-xs text-muted-foreground"
                      />
                    </div>

                  {/* Advanced Search Toggle Button - only visible on mobile */}
                  <div className="md:hidden">
                    <Button
                      variant="outline"
                      onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <TranslatedText contentKey="jobs.advanced_search" originalText="Advanced Search" />
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
                            <TranslatedText contentKey="jobs.location_label" originalText="Location" />
                          </label>
                          <Select value={locationFilter} onValueChange={setLocationFilter}>
                            <SelectTrigger className="w-full bg-background">
                              <SelectValue placeholder="All locations">
                                {locationFilter === 'all' ? 'All locations' : locationFilter}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-background z-50">
                              <SelectItem value="all"><TranslatedText contentKey="jobs.all_locations" originalText="All locations" /></SelectItem>
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
                            <TranslatedText contentKey="jobs.employer_label" originalText="Employer" />
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
                            <TranslatedText contentKey="jobs.clear_filters" originalText="Clear Filters" />
                          </Button>
                        </div>
                     </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="state" className="mt-0">
            <Card className="mb-8">
              <CardContent className="p-6">
                 {/* Always visible: Job Title Search */}
                 <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <TranslatedText contentKey="jobs.job_title_label" originalText="Job Title" />
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search job title using AI"
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
                          <TranslatedText 
                            contentKey="jobs.search_button" 
                            originalText={isSearching ? 'Searching...' : 'Search'}
                          />
                        </Button>
                      </div>
                      <TranslatedText 
                        contentKey="jobs.search_hint" 
                        originalText="Smart search matches similar job titles. Press Enter or click Search."
                        as="p"
                        className="text-xs text-muted-foreground"
                      />
                    </div>

                  {/* Advanced Search Toggle Button - only visible on mobile */}
                  <div className="md:hidden">
                    <Button
                      variant="outline"
                      onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <TranslatedText contentKey="jobs.advanced_search" originalText="Advanced Search" />
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
                            <TranslatedText contentKey="jobs.location_label" originalText="Location" />
                          </label>
                          <Select value={locationFilter} onValueChange={setLocationFilter}>
                            <SelectTrigger className="w-full bg-background">
                              <SelectValue placeholder="All locations">
                                {locationFilter === 'all' ? 'All locations' : locationFilter}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-background z-50">
                              <SelectItem value="all"><TranslatedText contentKey="jobs.all_locations" originalText="All locations" /></SelectItem>
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
                            <TranslatedText contentKey="jobs.employer_label" originalText="Employer" />
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
                            <TranslatedText contentKey="jobs.clear_filters" originalText="Clear Filters" />
                          </Button>
                        </div>
                     </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
        </div>

        {/* Job List */}
        <JobList jobs={paginatedJobs} loading={loading} isSearching={isSearching} />
        
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