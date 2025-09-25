import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProcessingResult {
  success: boolean;
  message: string;
  agenciesProcessed?: number;
  error?: string;
}

// Agency Document Upload Component - Force Refresh
const AgencyDocumentUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('general');
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (
      selectedFile.type === 'application/pdf' || 
      selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      selectedFile.type === 'application/msword'
    )) {
      setFile(selectedFile);
      setResult(null);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF or Word document (.pdf, .doc, .docx).",
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
      // Upload document to Supabase Storage
      const fileName = `agency-doc-${Date.now()}.${file.name.split('.').pop()}`;
      
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

      // Call edge function to process the document
      const { data: processData, error: processError } = await supabase.functions.invoke('process-agency-pdf', {
        body: { 
          fileUrl: publicUrl,
          fileName: file.name,
          documentType: documentType
        }
      });

      if (processError) {
        throw new Error(`Processing failed: ${processError.message}`);
      }

      setUploadProgress(100);
      setResult(processData);

      toast({
        title: "Success!",
        description: `Document processed successfully. Content length: ${processData.contentLength} characters.`,
      });

      // Clean up the uploaded file after processing
      await supabase.storage
        .from('event-images')
        .remove([fileName]);

    } catch (error) {
      console.error('Upload/processing error:', error);
      setResult({
        success: false,
        message: 'Failed to process document',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to process document',
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
    setDocumentType('general');
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
            Upload Agency Document
          </CardTitle>
          <CardDescription>
            Upload a PDF or Word document containing government agency information to automatically update the database and improve search results.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="document-type" className="text-sm font-medium">
              Document Type
            </label>
            <Select value={documentType} onValueChange={setDocumentType} disabled={uploading}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General NYC Agencies</SelectItem>
                <SelectItem value="311">NYC 311 Specific</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="pdf-upload" className="text-sm font-medium">
              Select Document File (PDF, Word)
            </label>
            <Input
              id="pdf-upload"
              type="file"
              accept=".pdf,.doc,.docx"
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
                  {processing && "Processing document..."}
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
              {uploading ? "Processing..." : "Upload & Process Document"}
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
            <p>• <strong>General NYC Agencies:</strong> Upload documents containing broad government agency information</p>
            <p>• <strong>NYC 311 Specific:</strong> Upload documents with detailed 311 complaint types and specific URLs</p>
            <p>• You can upload multiple documents - they will work together to provide better search results</p>
            <p>• The system automatically extracts agency info, descriptions, contact details, and hyperlinks</p>
            <p>• This improves the "Solve My Issue" search functionality with specific complaint URLs when available</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgencyDocumentUpload;