import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProcessingResult {
  success: boolean;
  message: string;
  agenciesProcessed?: number;
  error?: string;
}

const AgencyPDFUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setResult(null);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file.",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setResult(null);

    try {
      // Upload PDF to Supabase Storage
      const fileName = `agency-pdf-${Date.now()}.pdf`;
      
      setUploadProgress(25);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(fileName, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setUploadProgress(50);
      setProcessing(true);

      // Get the public URL of the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(fileName);

      setUploadProgress(75);

      // Call edge function to process the PDF
      const { data: processData, error: processError } = await supabase.functions.invoke('process-agency-pdf', {
        body: { 
          fileUrl: publicUrl,
          fileName: file.name
        }
      });

      if (processError) {
        throw new Error(`Processing failed: ${processError.message}`);
      }

      setUploadProgress(100);
      setResult(processData);

      toast({
        title: "Success!",
        description: `PDF processed successfully. ${processData.agenciesProcessed || 0} agencies updated.`,
      });

      // Clean up the uploaded file after processing
      await supabase.storage
        .from('event-images')
        .remove([fileName]);

    } catch (error) {
      console.error('Upload/processing error:', error);
      setResult({
        success: false,
        message: 'Failed to process PDF',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to process PDF',
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProcessing(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setUploadProgress(0);
    // Reset the file input
    const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload Agency PDF
          </CardTitle>
          <CardDescription>
            Upload a PDF containing government agency information to automatically update the database and improve search results.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="pdf-upload" className="text-sm font-medium">
              Select PDF File
            </label>
            <Input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              disabled={uploading}
              className="cursor-pointer"
            />
          </div>

          {file && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </AlertDescription>
            </Alert>
          )}

          {(uploading || processing) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {uploading && !processing && "Uploading..."}
                  {processing && "Processing PDF..."}
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex items-center gap-2"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? "Processing..." : "Upload & Process PDF"}
            </Button>
            
            {file && !uploading && (
              <Button
                onClick={resetForm}
                variant="outline"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          {result.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            <div className="space-y-1">
              <p>{result.message}</p>
              {result.agenciesProcessed && (
                <p className="text-sm font-medium">
                  Agencies processed: {result.agenciesProcessed}
                </p>
              )}
              {result.error && (
                <p className="text-sm text-destructive">
                  Error details: {result.error}
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2 text-muted-foreground">
            <p>• Upload PDF documents containing government agency information</p>
            <p>• The system will automatically extract agency names, descriptions, contact info, and websites</p>
            <p>• Hyperlinks within the PDF will be preserved and extracted</p>
            <p>• Duplicate agencies will be updated with new information</p>
            <p>• This improves the "Solve My Issue" search functionality for users</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgencyPDFUpload;