import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import CommunityAlertBanner from '@/components/CommunityAlertBanner';
import JobList from '@/components/JobList';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Briefcase, MapPin, DollarSign, Building, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

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
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [employerFilter, setEmployerFilter] = useState('all');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, locationFilter, employerFilter, minSalary, maxSalary]);

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

  const filterJobs = () => {
    let filtered = [...jobs];

    // Search by job title
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase())
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

    // Filter by salary range
    if (minSalary || maxSalary) {
      filtered = filtered.filter(job => {
        // Extract numeric values from salary string
        const salaryNumbers = job.salary.match(/\d+/g);
        if (!salaryNumbers) return true;
        
        const jobSalary = parseInt(salaryNumbers[0]);
        const min = minSalary ? parseInt(minSalary) : 0;
        const max = maxSalary ? parseInt(maxSalary) : Infinity;
        
        return jobSalary >= min && jobSalary <= max;
      });
    }

    setFilteredJobs(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocationFilter('all');
    setEmployerFilter('all');
    setMinSalary('');
    setMaxSalary('');
  };

  const uniqueLocations = [...new Set(jobs.map(job => job.location))];
  const uniqueEmployers = [...new Set(jobs.map(job => job.employer))];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CommunityAlertBanner />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back to Main Menu */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 hover:bg-primary hover:text-white transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Main Menu
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Next <span className="text-primary">Opportunity</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover job opportunities in your community and take the next step in your career
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {/* Always visible: Job Title Search */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Job Title
                </label>
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Location Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </label>
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All locations" />
                      </SelectTrigger>
                      <SelectContent>
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
                    <Select value={employerFilter} onValueChange={setEmployerFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All employers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All employers</SelectItem>
                        {uniqueEmployers.map(employer => (
                          <SelectItem key={employer} value={employer}>{employer}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Salary Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Min Salary
                    </label>
                    <Input
                      type="number"
                      placeholder="Min $"
                      value={minSalary}
                      onChange={(e) => setMinSalary(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Salary</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Max $"
                        value={maxSalary}
                        onChange={(e) => setMaxSalary(e.target.value)}
                      />
                      <Button variant="outline" onClick={clearFilters} className="shrink-0">
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
        </div>

        {/* Job List */}
        <JobList jobs={filteredJobs} loading={loading} />
      </main>
    </div>
  );
}