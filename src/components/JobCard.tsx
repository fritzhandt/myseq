import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import JobReportModal from '@/components/JobReportModal';
import { Building, MapPin, DollarSign, ExternalLink, Info, Flag, MoreHorizontal, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const isMobile = useIsMobile();

  const formatSalary = (salary: string) => {
    return salary.replace(/(\d+)/g, '$$$1');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Posted today';
    if (diffDays <= 7) return `Posted ${diffDays} days ago`;
    return `Posted ${date.toLocaleDateString()}`;
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
            {isMobile ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDetailsDialog(true)}
                className="text-xs"
              >
                <MoreHorizontal className="h-3 w-3 mr-1" />
                More Info
              </Button>
            ) : (
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
            )}
          </div>
        </div>
      </Card>

      {/* Mobile Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-left">{job.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-primary" />
                <span className="font-medium">{job.employer}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="font-medium">{formatSalary(job.salary)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(job.created_at)}</span>
              </div>
            </div>
            
            {job.description && (
              <div className="p-3 bg-muted/30 rounded-lg border-l-2 border-l-primary/30">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {job.description}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDetailsDialog(false);
                setShowReportModal(true);
              }}
              className="w-full sm:w-auto"
            >
              <Flag className="h-4 w-4 mr-2" />
              Report Job
            </Button>
            <Button 
              onClick={() => {
                setShowDetailsDialog(false);
                handleApplyClick();
              }}
              className="w-full sm:w-auto"
            >
              {job.is_apply_link ? (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Apply Now
                </>
              ) : (
                <>
                  <Info className="h-4 w-4 mr-2" />
                  Application Info
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExternalDialog} onOpenChange={setShowExternalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leaving This Site</DialogTitle>
            <DialogDescription className="text-left">
              This link is taking you to an external website:
              <br />
              <strong>{job.apply_info}</strong>
              <br /><br />
              This is a third-party website not operated by us. Your information will be 
              handled according to their privacy policies and terms of service.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExternalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExternalConfirm}>
              Continue to External Site
              <ExternalLink className="ml-2 w-4 h-4" />
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