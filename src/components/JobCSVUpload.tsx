import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, Trash2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Job {
  employer: string;
  title: string;
  location: string;
  salary: string;
  apply: string;
  description: string;
}

export default function JobCSVUpload() {
  const [uploading, setUploading] = useState(false);
  const [previewJobs, setPreviewJobs] = useState<Job[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseCSV = (text: string): Job[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    // Skip header row and parse data
    const jobs: Job[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(val => val.trim().replace(/^"|"$/g, ''));
      if (values.length >= 6) {
        jobs.push({
          employer: values[0],
          title: values[1],
          location: values[2],
          salary: values[3],
          apply: values[4],
          description: values[5]
        });
      }
    }
    return jobs;
  };

  const isValidURL = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const text = await file.text();
      const parsedJobs = parseCSV(text);
      
      if (parsedJobs.length === 0) {
        toast({
          title: "No valid jobs found",
          description: "Please check your CSV format and try again.",
          variant: "destructive",
        });
        return;
      }

      setPreviewJobs(parsedJobs);
      toast({
        title: "CSV loaded successfully",
        description: `Found ${parsedJobs.length} jobs. Review and import.`,
      });
    } catch (error) {
      toast({
        title: "Error reading file",
        description: "Please check your CSV format and try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleImportJobs = async () => {
    if (previewJobs.length === 0) return;

    setUploading(true);
    try {
      const jobsToInsert = previewJobs.map(job => ({
        employer: job.employer,
        title: job.title,
        location: job.location,
        salary: job.salary,
        apply_info: job.apply,
        description: job.description,
        is_apply_link: isValidURL(job.apply)
      }));

      const { error } = await supabase
        .from('jobs')
        .insert(jobsToInsert);

      if (error) throw error;

      toast({
        title: "Jobs imported successfully",
        description: `${previewJobs.length} jobs have been added to the database.`,
      });

      setPreviewJobs([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast({
        title: "Error importing jobs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const clearPreview = () => {
    setPreviewJobs([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Jobs from CSV
          </CardTitle>
          <CardDescription>
            Upload a CSV file with job listings. The format should include: employer, title, location, salary, apply, description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>CSV Format:</strong> A1: employer, A2: title, A3: location, A4: salary, A5: apply, A6: description.
                The apply field can be a URL (will show "Apply Now" button) or instructions (will show "Application Info").
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-4">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={uploading}
                className="flex-1"
              />
              {previewJobs.length > 0 && (
                <>
                  <Button 
                    onClick={handleImportJobs} 
                    disabled={uploading}
                    className="whitespace-nowrap"
                  >
                    {uploading ? 'Importing...' : `Import ${previewJobs.length} Jobs`}
                  </Button>
                  <Button 
                    onClick={clearPreview} 
                    variant="outline" 
                    disabled={uploading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {previewJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Preview ({previewJobs.length} jobs)
            </CardTitle>
            <CardDescription>
              Review the jobs before importing them to the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {previewJobs.slice(0, 5).map((job, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium">{job.title}</h4>
                      <p className="text-sm text-muted-foreground">{job.employer}</p>
                    </div>
                    <div>
                      <p className="text-sm"><strong>Location:</strong> {job.location}</p>
                      <p className="text-sm"><strong>Salary:</strong> {job.salary}</p>
                    </div>
                    <div>
                      <p className="text-sm">
                        <strong>Apply:</strong> {isValidURL(job.apply) ? 'Link provided' : 'Instructions provided'}
                      </p>
                    </div>
                  </div>
                  {job.description && (
                    <p className="text-sm text-muted-foreground mt-2 truncate">
                      {job.description.substring(0, 100)}...
                    </p>
                  )}
                </div>
              ))}
              {previewJobs.length > 5 && (
                <p className="text-center text-muted-foreground">
                  ... and {previewJobs.length - 5} more jobs
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}