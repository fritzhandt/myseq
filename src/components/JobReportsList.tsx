import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Building, MapPin, Trash2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface JobReport {
  id: string;
  reason: string;
  description: string | null;
  created_at: string;
  job_id: string;
  jobs: {
    id: string;
    title: string;
    employer: string;
    location: string;
    salary: string;
    category: string;
  };
}

export default function JobReportsList() {
  const [reports, setReports] = useState<JobReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('job_reports')
        .select(`
          id,
          reason,
          description,
          created_at,
          job_id,
          jobs (
            id,
            title,
            employer,
            location,
            salary,
            category
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch job reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleRemoveJob = async (reportId: string, jobId: string) => {
    setProcessingIds(prev => new Set([...prev, reportId]));
    
    try {
      // Delete the job (this will cascade delete the report due to foreign key)
      const { error: jobError } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (jobError) throw jobError;

      toast({
        title: "Job removed",
        description: "The job listing has been removed successfully",
      });

      // Remove from local state
      setReports(prev => prev.filter(report => report.id !== reportId));
    } catch (error) {
      console.error('Error removing job:', error);
      toast({
        title: "Error",
        description: "Failed to remove job listing",
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  const handleKeepJob = async (reportId: string) => {
    setProcessingIds(prev => new Set([...prev, reportId]));
    
    try {
      // Delete only the report
      const { error } = await supabase
        .from('job_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Report dismissed",
        description: "The job listing has been kept and the report dismissed",
      });

      // Remove from local state
      setReports(prev => prev.filter(report => report.id !== reportId));
    } catch (error) {
      console.error('Error dismissing report:', error);
      toast({
        title: "Error",
        description: "Failed to dismiss report",
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Job Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading reports...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Job Reports ({reports.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <p className="text-muted-foreground">No reports to review.</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {report.jobs.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {report.jobs.employer}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {report.jobs.location}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Badge variant="destructive" className="text-xs">
                          {report.reason}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          Reported on {formatDate(report.created_at)}
                        </p>
                        {report.description && (
                          <p className="text-sm bg-muted p-2 rounded">
                            "{report.description}"
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleKeepJob(report.id)}
                        disabled={processingIds.has(report.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Keep
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveJob(report.id, report.jobs.id)}
                        disabled={processingIds.has(report.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}