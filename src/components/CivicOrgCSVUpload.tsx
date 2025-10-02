import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import bcrypt from 'bcryptjs';

interface CivicOrgRow {
  name: string;
  description: string;
  coverage_area: string;
  meeting_info?: string;
  meeting_address?: string;
  email?: string;
  phone?: string;
  website?: string;
  organization_type?: string;
}

export default function CivicOrgCSVUpload({ onUploadComplete }: { onUploadComplete?: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [previewOrgs, setPreviewOrgs] = useState<CivicOrgRow[]>([]);
  const { toast } = useToast();

  const generateAccessCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const generatePassword = () => {
    const words = ['river', 'mountain', 'ocean', 'forest', 'valley', 'stone', 'cloud', 'wind'];
    const word1 = words[Math.floor(Math.random() * words.length)];
    const word2 = words[Math.floor(Math.random() * words.length)];
    const num1 = Math.floor(Math.random() * 100);
    const num2 = Math.floor(Math.random() * 100);
    return `${word1}${num1}${word2}${num2}`;
  };

  const parseXLSX = (arrayBuffer: ArrayBuffer): CivicOrgRow[] => {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    return data.map((row: any) => ({
      name: row.name || row.Name || '',
      description: row.description || row.Description || '',
      coverage_area: row.coverage_area || row['Coverage Area'] || row.area || '',
      meeting_info: row.meeting_info || row['Meeting Info'] || row.meeting || '',
      meeting_address: row.meeting_address || row['Meeting Address'] || row.address || '',
      email: row.email || row.Email || '',
      phone: row.phone || row.Phone || '',
      website: row.website || row.Website || '',
      organization_type: row.organization_type || row['Organization Type'] || 'civic_organization'
    }));
  };

  const parseCSV = (text: string): CivicOrgRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''));
      const obj: any = {};
      
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });

      return {
        name: obj.name || '',
        description: obj.description || '',
        coverage_area: obj.coverage_area || obj['coverage area'] || obj.area || '',
        meeting_info: obj.meeting_info || obj['meeting info'] || obj.meeting || '',
        meeting_address: obj.meeting_address || obj['meeting address'] || obj.address || '',
        email: obj.email || '',
        phone: obj.phone || '',
        website: obj.website || '',
        organization_type: obj.organization_type || obj['organization type'] || 'civic_organization'
      };
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV or XLSX file",
        variant: "destructive"
      });
      return;
    }

    try {
      let orgs: CivicOrgRow[] = [];

      if (fileExtension === 'csv') {
        const text = await file.text();
        orgs = parseCSV(text);
      } else {
        const arrayBuffer = await file.arrayBuffer();
        orgs = parseXLSX(arrayBuffer);
      }

      setPreviewOrgs(orgs);
      
      toast({
        title: "File parsed successfully",
        description: `Found ${orgs.length} organizations. Review and click Import to create them.`
      });
    } catch (error) {
      console.error('Error parsing file:', error);
      toast({
        title: "Error parsing file",
        description: "Please check your file format and try again",
        variant: "destructive"
      });
    }
  };

  const handleImportOrgs = async () => {
    if (previewOrgs.length === 0) {
      toast({
        title: "No organizations to import",
        description: "Please upload a file first",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const credentials: { accessCode: string; password: string; name: string }[] = [];
      
      const orgsToInsert = await Promise.all(
        previewOrgs.map(async (org) => {
          const accessCode = generateAccessCode();
          const password = generatePassword();
          const passwordHash = await bcrypt.hash(password, 10);

          credentials.push({ accessCode, password, name: org.name });

          return {
            name: org.name,
            description: org.description,
            coverage_area: org.coverage_area,
            meeting_info: org.meeting_info || null,
            meeting_address: org.meeting_address || null,
            access_code: accessCode,
            password_hash: passwordHash,
            contact_info: {
              email: org.email || '',
              phone: org.phone || '',
              website: org.website || ''
            },
            organization_type: org.organization_type || 'civic_organization',
            is_active: true
          };
        })
      );

      const { error } = await supabase
        .from('civic_organizations')
        .insert(orgsToInsert);

      if (error) throw error;

      // Display credentials to user
      const credentialsText = credentials.map(c => 
        `${c.name}:\n  Access Code: ${c.accessCode}\n  Password: ${c.password}`
      ).join('\n\n');

      console.log('Generated Credentials:\n', credentialsText);

      toast({
        title: "Organizations imported successfully",
        description: `${orgsToInsert.length} organizations created. Check console for credentials.`
      });

      clearPreview();
      onUploadComplete?.();
    } catch (error) {
      console.error('Error importing organizations:', error);
      toast({
        title: "Error importing organizations",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const clearPreview = () => {
    setPreviewOrgs([]);
    const fileInput = document.getElementById('org-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Upload Organizations
          </CardTitle>
          <CardDescription>
            Upload a CSV or XLSX file to create multiple civic organizations at once
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              id="org-file-input"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => document.getElementById('org-file-input')?.click()}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose File
            </Button>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Required columns:</strong> name, description, coverage_area
              <br />
              <strong>Optional columns:</strong> meeting_info, meeting_address, email, phone, website, organization_type
              <br />
              Access codes and passwords will be auto-generated for each organization.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {previewOrgs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview ({previewOrgs.length} organizations)</CardTitle>
            <CardDescription>
              Review the organizations below before importing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-left">Coverage Area</th>
                    <th className="p-2 text-left">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {previewOrgs.slice(0, 10).map((org, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{org.name}</td>
                      <td className="p-2">{org.description.substring(0, 50)}...</td>
                      <td className="p-2">{org.coverage_area}</td>
                      <td className="p-2">{org.organization_type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewOrgs.length > 10 && (
                <div className="p-2 text-center text-muted-foreground border-t">
                  ... and {previewOrgs.length - 10} more
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleImportOrgs}
                disabled={uploading}
                className="flex-1"
              >
                {uploading ? 'Importing...' : `Import ${previewOrgs.length} Organizations`}
              </Button>
              <Button
                onClick={clearPreview}
                variant="outline"
                disabled={uploading}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
