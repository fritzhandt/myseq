import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, AlertCircle, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ResourceRow {
  organization_name: string;
  description: string;
  categories: string; // comma-separated
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  type?: string;
}

interface ResourceCSVUploadProps {
  onUploadComplete?: () => void;
}

const ResourceCSVUpload = ({ onUploadComplete }: ResourceCSVUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewResources, setPreviewResources] = useState<ResourceRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseXLSX = (arrayBuffer: ArrayBuffer): ResourceRow[] => {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<any>(worksheet);

    return data.map(row => ({
      organization_name: row.organization_name || row['Organization Name'] || '',
      description: row.description || row.Description || '',
      categories: row.categories || row.Categories || '',
      website: row.website || row.Website || '',
      email: row.email || row.Email || '',
      phone: row.phone || row.Phone || '',
      address: row.address || row.Address || '',
      type: row.type || row.Type || 'resource',
    }));
  };

  const parseCSV = (text: string): ResourceRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    
    return lines.slice(1).map(line => {
      const values: string[] = [];
      let currentValue = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim());

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      return {
        organization_name: row.organization_name || row['organization name'] || '',
        description: row.description || '',
        categories: row.categories || '',
        website: row.website || '',
        email: row.email || '',
        phone: row.phone || '',
        address: row.address || '',
        type: row.type || 'resource',
      };
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
      toast.error('Invalid file type. Please upload a CSV or XLSX file.');
      return;
    }

    setUploading(true);

    try {
      let resources: ResourceRow[] = [];

      if (fileExtension === 'csv') {
        const text = await file.text();
        resources = parseCSV(text);
      } else {
        const arrayBuffer = await file.arrayBuffer();
        resources = parseXLSX(arrayBuffer);
      }

      setPreviewResources(resources);
      toast.success(`Parsed ${resources.length} resources from file`);
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('Failed to parse file. Please check the format.');
    } finally {
      setUploading(false);
    }
  };

  const ensureProtocol = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const handleImportResources = async () => {
    if (previewResources.length === 0) {
      toast.error('No resources to import');
      return;
    }

    setUploading(true);

    try {
      const processedResources = previewResources.map(resource => ({
        organization_name: resource.organization_name,
        description: resource.description,
        categories: resource.categories.split(',').map(c => c.trim()).filter(Boolean),
        website: resource.website ? ensureProtocol(resource.website) : null,
        email: resource.email || null,
        phone: resource.phone || null,
        address: resource.address || null,
        type: resource.type || 'resource',
        logo_url: null,
        cover_photo_url: null,
      }));

      const { error } = await supabase
        .from('resources')
        .insert(processedResources);

      if (error) throw error;

      toast.success(`Successfully imported ${processedResources.length} resources`);
      clearPreview();
      onUploadComplete?.();
    } catch (error) {
      console.error('Error importing resources:', error);
      toast.error('Failed to import resources. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const clearPreview = () => {
    setPreviewResources([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Upload Resources
          </CardTitle>
          <CardDescription>
            Upload a CSV or XLSX file to add multiple resources at once
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Required columns:</strong> organization_name, description, categories (comma-separated)
              <br />
              <strong>Optional columns:</strong> website, email, phone, address, type
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="resource-csv-upload"
              />
              <label htmlFor="resource-csv-upload">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  asChild
                >
                  <span className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Processing...' : 'Select File'}
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {previewResources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                Preview ({previewResources.length} resources)
              </span>
            </CardTitle>
            <CardDescription>
              Review the resources before importing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">Organization</th>
                    <th className="text-left p-2 font-semibold">Description</th>
                    <th className="text-left p-2 font-semibold">Categories</th>
                    <th className="text-left p-2 font-semibold">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {previewResources.slice(0, 10).map((resource, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2">{resource.organization_name}</td>
                      <td className="p-2 max-w-xs truncate">{resource.description}</td>
                      <td className="p-2">{resource.categories}</td>
                      <td className="p-2 text-xs">
                        {resource.email && <div>{resource.email}</div>}
                        {resource.phone && <div>{resource.phone}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewResources.length > 10 && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Showing first 10 of {previewResources.length} resources
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={clearPreview}
                disabled={uploading}
              >
                Clear
              </Button>
              <Button
                onClick={handleImportResources}
                disabled={uploading}
              >
                {uploading ? 'Importing...' : `Import ${previewResources.length} Resources`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResourceCSVUpload;
