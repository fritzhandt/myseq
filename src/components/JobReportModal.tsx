import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TranslatedText } from '@/components/TranslatedText';

interface JobReportModalProps {
  jobId: string;
  jobTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  'Spam or fake job posting',
  'Inappropriate content',
  'Misleading information',
  'Scam or fraudulent',
  'Duplicate posting',
  'Incorrect/missing link',
  'Job unavailable',
  'Other'
];

export default function JobReportModal({ jobId, jobTitle, isOpen, onClose }: JobReportModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Error",
        description: "Please select a reason for reporting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('job_reports')
        .insert({
          job_id: jobId,
          reason,
          description: description.trim() || null
        });

      if (error) throw error;

      toast({
        title: "Report submitted",
        description: "Thank you for reporting this job listing. We'll review it shortly.",
      });

      setReason('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <TranslatedText contentKey="job_report.title" originalText="Report Job Listing" />
          </DialogTitle>
          <DialogDescription>
            <TranslatedText 
              contentKey="job_report.description" 
              originalText={`Report "${jobTitle}" for review by administrators.`}
            />
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              <TranslatedText contentKey="job_report.reason_label" originalText="Reason for reporting *" />
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((reportReason) => (
                  <SelectItem key={reportReason} value={reportReason}>
                    <TranslatedText 
                      contentKey={`job_report.reason_${reportReason.toLowerCase().replace(/\s+/g, '_')}`}
                      originalText={reportReason}
                    />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">
              <TranslatedText contentKey="job_report.details_label" originalText="Additional details (optional)" />
            </Label>
            <Textarea
              id="description"
              placeholder="Provide additional context about why you're reporting this job..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            <TranslatedText contentKey="job_report.cancel" originalText="Cancel" />
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <TranslatedText 
              contentKey="job_report.submit" 
              originalText={isSubmitting ? "Submitting..." : "Submit Report"}
            />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}