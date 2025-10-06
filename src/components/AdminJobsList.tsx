import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Building2, MapPin, Edit, Ban, Search } from 'lucide-react';
import AdminPagination from './AdminPagination';
import { useToast } from '@/hooks/use-toast';
import JobEditDialog from './JobEditDialog';
import { useUserRole } from '@/hooks/useUserRole';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Job {
  id: string;
  employer: string;
  title: string;
  location: string;
  salary: string;
  description: string;
  apply_info: string;
  is_apply_link: boolean;
  category: string;
  subcategory: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminJobsList() {
  const [governmentJobs, setGovernmentJobs] = useState<Job[]>([]);
  const [privateSectorJobs, setPrivateSectorJobs] = useState<Job[]>([]);
  const [filteredGovJobs, setFilteredGovJobs] = useState<Job[]>([]);
  const [filteredPrivateJobs, setFilteredPrivateJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentGovPage, setCurrentGovPage] = useState(1);
  const [currentPrivatePage, setCurrentPrivatePage] = useState(1);
  const [currentCityPage, setCurrentCityPage] = useState(1);
  const [currentStatePage, setCurrentStatePage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();
  const { isSubAdmin, isMainAdmin } = useUserRole();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      const { data: govJobs, error: govError } = await supabase
        .from('jobs')
        .select('*')
        .eq('category', 'government')
        .order('created_at', { ascending: false });

      const { data: privateJobs, error: privateError } = await supabase
        .from('jobs')
        .select('*')
        .eq('category', 'private_sector')
        .order('created_at', { ascending: false });

      if (govError) throw govError;
      if (privateError) throw privateError;

      setGovernmentJobs(govJobs || []);
      setPrivateSectorJobs(privateJobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Filter jobs based on search term
  useEffect(() => {
    const filterJobs = (jobs: Job[]) => jobs.filter(job =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.employer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredGovJobs(filterJobs(governmentJobs));
    setFilteredPrivateJobs(filterJobs(privateSectorJobs));
    setCurrentGovPage(1);
    setCurrentPrivatePage(1);
    setCurrentCityPage(1);
    setCurrentStatePage(1);
  }, [searchTerm, governmentJobs, privateSectorJobs]);

  const handleDelete = async () => {
    if (!deleteJobId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Sub-admins create pending modification request
      if (isSubAdmin) {
        const job = [...governmentJobs, ...privateSectorJobs].find(j => j.id === deleteJobId);
        if (!job) throw new Error('Job not found');

        // Fetch profile info
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name, phone_number')
          .eq('user_id', user.id)
          .maybeSingle();

        const { error } = await supabase
          .from("pending_job_modifications")
          .insert({
            job_id: deleteJobId,
            action: 'delete',
            modified_data: job,
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
          .from('jobs')
          .delete()
          .eq('id', deleteJobId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Job deleted successfully",
        });
      }

      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    } finally {
      setDeleteJobId(null);
    }
  };

  const handleDeactivate = async (jobId: string, currentStatus: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const job = [...governmentJobs, ...privateSectorJobs].find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');

      // Sub-admins create pending modification request
      if (isSubAdmin) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name, phone_number')
          .eq('user_id', user.id)
          .maybeSingle();

        const { error } = await supabase
          .from("pending_job_modifications")
          .insert({
            job_id: jobId,
            action: 'update',
            modified_data: { ...job, is_active: !currentStatus },
            submitted_by: user.id,
            submitter_name: profile?.full_name || null,
            submitter_phone: profile?.phone_number || null
          });

        if (error) throw error;

        toast({
          title: "Request Submitted",
          description: `Your ${currentStatus ? 'deactivation' : 'activation'} request has been submitted for approval`,
        });
      } else {
        // Main admins update directly
        const { error } = await supabase
          .from('jobs')
          .update({ is_active: !currentStatus })
          .eq('id', jobId);

        if (error) throw error;

        toast({
          title: "Success",
          description: `Job ${currentStatus ? 'deactivated' : 'activated'} successfully`,
        });
      }

      fetchJobs();
    } catch (error) {
      console.error('Error toggling job status:', error);
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      });
    }
  };

  const JobCard = ({ job }: { job: Job }) => (
    <Card className={`mb-4 ${!job.is_active ? 'opacity-60' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{job.title}</h3>
              {!job.is_active && (
                <span className="px-2 py-0.5 bg-destructive/10 text-destructive text-xs rounded">
                  Inactive
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Building2 className="h-4 w-4" />
              <span>{job.employer}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
            <p className="text-sm font-medium mt-2">{job.salary}</p>
            {job.subcategory && (
              <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                {job.subcategory === 'city' ? 'City' : 'State'}
              </span>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditJob(job)}
              title="Edit job"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeactivate(job.id, job.is_active)}
              title={job.is_active ? "Deactivate job" : "Activate job"}
            >
              <Ban className={`h-4 w-4 ${job.is_active ? 'text-orange-500' : 'text-green-500'}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteJobId(job.id)}
              title="Delete job"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cityJobs = filteredGovJobs.filter(job => job.subcategory === 'city');
  const stateJobs = filteredGovJobs.filter(job => job.subcategory === 'state');

  // Pagination calculations
  const cityTotalPages = Math.ceil(cityJobs.length / itemsPerPage);
  const stateTotalPages = Math.ceil(stateJobs.length / itemsPerPage);
  const privateTotalPages = Math.ceil(filteredPrivateJobs.length / itemsPerPage);

  const paginatedCityJobs = cityJobs.slice((currentCityPage - 1) * itemsPerPage, currentCityPage * itemsPerPage);
  const paginatedStateJobs = stateJobs.slice((currentStatePage - 1) * itemsPerPage, currentStatePage * itemsPerPage);
  const paginatedPrivateJobs = filteredPrivateJobs.slice((currentPrivatePage - 1) * itemsPerPage, currentPrivatePage * itemsPerPage);

  return (
    <>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search jobs by title, employer, location, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchTerm && (
          <div className="text-sm text-muted-foreground mt-2">
            Found {filteredGovJobs.length + filteredPrivateJobs.length} job{filteredGovJobs.length + filteredPrivateJobs.length === 1 ? '' : 's'} matching "{searchTerm}"
          </div>
        )}
      </div>

      <Tabs defaultValue="government" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="government">Government Jobs ({filteredGovJobs.length})</TabsTrigger>
          <TabsTrigger value="private">Private Sector ({filteredPrivateJobs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="government" className="space-y-4">
          <Tabs defaultValue="city" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="city">City ({cityJobs.length})</TabsTrigger>
              <TabsTrigger value="state">State ({stateJobs.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="city" className="space-y-4 mt-4">
              {cityJobs.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    {searchTerm ? 'No city jobs match your search' : 'No city jobs found'}
                  </CardContent>
                </Card>
              ) : (
                <>
                  {paginatedCityJobs.map(job => <JobCard key={job.id} job={job} />)}
                  {cityJobs.length > itemsPerPage && (
                    <AdminPagination
                      currentPage={currentCityPage}
                      totalPages={cityTotalPages}
                      totalItems={cityJobs.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentCityPage}
                    />
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="state" className="space-y-4 mt-4">
              {stateJobs.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    {searchTerm ? 'No state jobs match your search' : 'No state jobs found'}
                  </CardContent>
                </Card>
              ) : (
                <>
                  {paginatedStateJobs.map(job => <JobCard key={job.id} job={job} />)}
                  {stateJobs.length > itemsPerPage && (
                    <AdminPagination
                      currentPage={currentStatePage}
                      totalPages={stateTotalPages}
                      totalItems={stateJobs.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentStatePage}
                    />
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="private" className="space-y-4">
          {filteredPrivateJobs.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                {searchTerm ? 'No private sector jobs match your search' : 'No private sector jobs found'}
              </CardContent>
            </Card>
          ) : (
            <>
              {paginatedPrivateJobs.map(job => <JobCard key={job.id} job={job} />)}
              {filteredPrivateJobs.length > itemsPerPage && (
                <AdminPagination
                  currentPage={currentPrivatePage}
                  totalPages={privateTotalPages}
                  totalItems={filteredPrivateJobs.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPrivatePage}
                />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <JobEditDialog
        job={editJob}
        open={!!editJob}
        onOpenChange={(open) => !open && setEditJob(null)}
        onSuccess={fetchJobs}
      />

      <AlertDialog open={!!deleteJobId} onOpenChange={(open) => !open && setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job posting? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
