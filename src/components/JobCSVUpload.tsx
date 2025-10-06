import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, Trash2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import * as XLSX from 'xlsx';

interface Job {
  company: string;
  location: string;
  position: string;
  type: string;
  applyLink: string;
  description?: string;
  salary?: string;
}

export default function JobCSVUpload() {
  const { toast } = useToast();
  const { isSubAdmin } = useUserRole();
  const [uploading, setUploading] = useState(false);
  const [previewJobs, setPreviewJobs] = useState<Job[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('government');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('city');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCategoryValue = () => {
    if (selectedCategory === 'government') return 'government';
    if (selectedCategory === 'state') return 'government';
    if (selectedCategory === 'private') return 'private';
    if (selectedCategory === 'internships') return 'internships';
    return selectedCategory;
  };

  const getSubcategoryValue = () => {
    if (selectedCategory === 'government') return 'city';
    if (selectedCategory === 'state') return 'state';
    return null;
  };

  const parseXLSX = (arrayBuffer: ArrayBuffer): Job[] => {
    try {
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert sheet to JSON, treating first row as headers
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
      
      if (jsonData.length < 2) return [];
      
      // Skip header row and parse data
      const jobs: Job[] = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row && row.length >= 5 && row[0] && row[2]) { // Ensure we have company and position at minimum
          jobs.push({
            company: String(row[0] || '').trim(),
            location: String(row[1] || '').trim(),
            position: String(row[2] || '').trim(),
            type: String(row[3] || '').trim(),
            applyLink: String(row[4] || '').trim()
          });
        }
      }
      return jobs;
    } catch (error) {
      console.error('Error parsing XLSX:', error);
      return [];
    }
  };

  const parseCSV = (text: string): Job[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    // Skip header row and parse data
    const jobs: Job[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(val => val.trim().replace(/^"|"$/g, ''));
      if (values.length >= 5) {
        jobs.push({
          company: values[0],
          location: values[1],
          position: values[2],
          type: values[3],
          applyLink: values[4]
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

    const isCSV = file.name.endsWith('.csv');
    const isXLSX = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (!isCSV && !isXLSX) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV or XLSX file.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      let parsedJobs: Job[] = [];

      if (isCSV) {
        const text = await file.text();
        parsedJobs = parseCSV(text);
      } else if (isXLSX) {
        const arrayBuffer = await file.arrayBuffer();
        parsedJobs = parseXLSX(arrayBuffer);
      }
      
      if (parsedJobs.length === 0) {
        toast({
          title: "No valid jobs found",
          description: "Please check your file format and try again.",
          variant: "destructive",
        });
        return;
      }

      setPreviewJobs(parsedJobs);
      toast({
        title: "File loaded successfully",
        description: `Found ${parsedJobs.length} jobs. Review and import.`,
      });
    } catch (error) {
      console.error('File parsing error:', error);
      toast({
        title: "Error reading file",
        description: "Please check your file format and try again.",
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
        employer: job.company,
        title: job.position,
        location: job.location,
        salary: job.salary || job.type,
        apply_info: job.applyLink,
        description: job.description || `${job.type} position at ${job.company}`,
        is_apply_link: isValidURL(job.applyLink),
        category: getCategoryValue(),
        subcategory: getSubcategoryValue(),
      }));

      // Sub-admins jobs are not currently supported in pending tables
      // Jobs go directly to main table for all users
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
    setSelectedCategory('government');
    setSelectedSubcategory('city');
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
            Import Jobs from CSV/XLSX
          </CardTitle>
          <CardDescription>
            Upload a CSV or Excel file with job listings. The format should include: Company/Organization, Location, Position, Type, Link to Apply
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Job Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="government">City Government</SelectItem>
                  <SelectItem value="state">State Government</SelectItem>
                  <SelectItem value="private">Private Sector</SelectItem>
                  <SelectItem value="internships">Internships</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>File Format:</strong> CSV or Excel (.xlsx) files are supported. Column A: Company/Organization, Column B: Location, Column C: Position, Column D: Type, Column E: Link to Apply.
                The Link to Apply can be a URL (will show "Apply Now" button) or application instructions.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-4">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
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
              {/* Table Header */}
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="grid grid-cols-5 gap-4 text-sm font-medium">
                  <div>Company/Organization</div>
                  <div>Location</div>
                  <div>Position</div>
                  <div>Type</div>
                  <div>Link to Apply</div>
                </div>
              </div>
              
              {/* Table Rows */}
              {previewJobs.slice(0, 10).map((job, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="grid grid-cols-5 gap-4 text-sm">
                    <div className="font-medium">{job.company}</div>
                    <div>{job.location}</div>
                    <div>{job.position}</div>
                    <div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                        {job.type}
                      </span>
                    </div>
                    <div className="truncate">
                      {isValidURL(job.applyLink) ? (
                        <span className="text-blue-600">🔗 Application Link</span>
                      ) : (
                        <span className="text-muted-foreground">📝 Instructions</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {previewJobs.length > 10 && (
                <p className="text-center text-muted-foreground">
                  ... and {previewJobs.length - 10} more jobs
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}