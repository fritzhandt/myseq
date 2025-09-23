import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import JobReportModal from '@/components/JobReportModal';
import { Building, MapPin, DollarSign, ExternalLink, Info, Flag } from 'lucide-react';
import { useState } from 'react';

interface Job {
  id: string;
  employer: string;
  title: string;
  location: string;
  salary: string;
  apply_info: string;
  description: string;
  is_apply_link: boolean;
  created_at: string;
  category: string;
}

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const [showExternalDialog, setShowExternalDialog] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const formatSalary = (salary: string) => {
    return salary.replace(/(\d+)/g, '$$$1');
  };

  const handleApplyClick = () => {
    if (job.is_apply_link) {
      setShowExternalDialog(true);
    } else {
      alert(`Application Instructions: ${job.apply_info}`);
    }
  };

  const handleExternalConfirm = () => {
    window.open(job.apply_info, '_blank');
    setShowExternalDialog(false);
  };

  return (
    <>
      <Card className="p-4 border border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{job.title}</h3>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <Building className="h-3 w-3" />
              <span className="truncate">{job.employer}</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{job.location}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge variant="secondary" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              {formatSalary(job.salary)}
            </Badge>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowReportModal(true)}
                className="text-xs"
              >
                <Flag className="h-3 w-3 mr-1" />
                Report
              </Button>
              <Button onClick={handleApplyClick} size="sm" className="text-xs">
                {job.is_apply_link ? (
                  <>
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Apply
                  </>
                ) : (
                  <>
                    <Info className="h-3 w-3 mr-1" />
                    Info
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={showExternalDialog} onOpenChange={setShowExternalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leaving Site</DialogTitle>
            <DialogDescription>
              You are about to visit an external website. This will open in a new tab.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExternalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExternalConfirm}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <JobReportModal
        jobId={job.id}
        jobTitle={job.title}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </>
  );
}