import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Building2, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  category: string;
  subcategory: string | null;
  created_at: string;
}

export default function AdminJobsList() {
  const [governmentJobs, setGovernmentJobs] = useState<Job[]>([]);
  const [privateSectorJobs, setPrivateSectorJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
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

  const JobCard = ({ job }: { job: Job }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{job.title}</h3>
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteJobId(job.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
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

  const cityJobs = governmentJobs.filter(job => job.subcategory === 'city');
  const stateJobs = governmentJobs.filter(job => job.subcategory === 'state');

  return (
    <>
      <Tabs defaultValue="government" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="government">Government Jobs ({governmentJobs.length})</TabsTrigger>
          <TabsTrigger value="private">Private Sector ({privateSectorJobs.length})</TabsTrigger>
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
                    No city jobs found
                  </CardContent>
                </Card>
              ) : (
                cityJobs.map(job => <JobCard key={job.id} job={job} />)
              )}
            </TabsContent>

            <TabsContent value="state" className="space-y-4 mt-4">
              {stateJobs.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No state jobs found
                  </CardContent>
                </Card>
              ) : (
                stateJobs.map(job => <JobCard key={job.id} job={job} />)
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="private" className="space-y-4">
          {privateSectorJobs.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No private sector jobs found
              </CardContent>
            </Card>
          ) : (
            privateSectorJobs.map(job => <JobCard key={job.id} job={job} />)
          )}
        </TabsContent>
      </Tabs>

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
