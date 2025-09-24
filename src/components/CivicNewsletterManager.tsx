import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Upload, Trash2, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import PDFViewer from "./PDFViewer";

interface CivicNewsletterManagerProps {
  orgId: string;
}

interface Newsletter {
  id: string;
  title: string;
  file_path: string;
  upload_date: string;
}

const CivicNewsletterManager = ({ orgId }: CivicNewsletterManagerProps) => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<{url: string; title: string} | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    file: null as File | null,
  });

  useEffect(() => {
    fetchNewsletters();
  }, [orgId]);

  const fetchNewsletters = async () => {
    try {
      const { data, error } = await supabase
        .from('civic_newsletters')
        .select('*')
        .eq('civic_org_id', orgId)
        .order('upload_date', { ascending: false });

      if (error) throw error;

      setNewsletters(data || []);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      toast({
        title: "Error",
        description: "Failed to load newsletters",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Error",
          description: "Please select a PDF file",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "Error",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }

      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!formData.title.trim() || !formData.file) {
      toast({
        title: "Error",
        description: "Please provide a title and select a PDF file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const fileExt = 'pdf';
      const fileName = `${orgId}/${formData.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${fileExt}`;
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('civic-files')
        .upload(fileName, formData.file);

      if (uploadError) throw uploadError;

      setUploadProgress(70);

      // Save newsletter record
      const { error: dbError } = await supabase
        .from('civic_newsletters')
        .insert({
          civic_org_id: orgId,
          title: formData.title,
          file_path: uploadData.path,
        });

      if (dbError) throw dbError;

      setUploadProgress(100);

      toast({
        title: "Success",
        description: "Newsletter uploaded successfully",
      });

      setFormData({ title: "", file: null });
      setIsDialogOpen(false);
      fetchNewsletters();
    } catch (error) {
      console.error('Error uploading newsletter:', error);
      toast({
        title: "Error",
        description: "Failed to upload newsletter",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (newsletter: Newsletter) => {
    try {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('civic-files')
        .remove([newsletter.file_path]);

      if (storageError) throw storageError;

      // Delete database record
      const { error: dbError } = await supabase
        .from('civic_newsletters')
        .delete()
        .eq('id', newsletter.id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Newsletter deleted successfully",
      });

      fetchNewsletters();
    } catch (error) {
      console.error('Error deleting newsletter:', error);
      toast({
        title: "Error",
        description: "Failed to delete newsletter",
        variant: "destructive",
      });
    }
  };

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage.from('civic-files').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleViewPDF = (newsletter: Newsletter) => {
    setSelectedPDF({
      url: getFileUrl(newsletter.file_path),
      title: newsletter.title
    });
  };

  const resetForm = () => {
    setFormData({ title: "", file: null });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Newsletter Management
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Newsletter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Newsletter</DialogTitle>
                <DialogDescription>
                  Upload a PDF newsletter to share with your community members.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Newsletter Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Monthly Newsletter - January 2024"
                  />
                </div>
                <div>
                  <Label htmlFor="file">PDF File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF files only, maximum 10MB
                  </p>
                </div>
                
                {uploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} />
                    <p className="text-sm text-muted-foreground text-center">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpload} disabled={uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {newsletters.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No newsletters yet</h3>
            <p className="text-muted-foreground">
              Upload your first newsletter to share updates with your community.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {newsletters.map((newsletter) => (
              <div key={newsletter.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-red-600" />
                  <div>
                    <h3 className="font-medium">{newsletter.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Uploaded {format(parseISO(newsletter.upload_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">PDF</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewPDF(newsletter)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(newsletter)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* PDF Viewer */}
      {selectedPDF && (
        <PDFViewer
          isOpen={!!selectedPDF}
          onClose={() => setSelectedPDF(null)}
          pdfUrl={selectedPDF.url}
          title={selectedPDF.title}
        />
      )}
    </Card>
  );
};

export default CivicNewsletterManager;