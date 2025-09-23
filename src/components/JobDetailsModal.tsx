import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, DollarSign, ExternalLink, Calendar } from 'lucide-react';
import { format } from 'date-fns';

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
}

interface JobDetailsModalProps {
  job: Job;
  onClose: () => void;
}

export default function JobDetailsModal({ job, onClose }: JobDetailsModalProps) {
  const formatSalary = (salary: string) => {
    return salary.replace(/(\d+)/g, '$$$1');
  };

  const handleApplyClick = () => {
    if (job.is_apply_link) {
      window.open(job.apply_info, '_blank');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4">{job.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Job Info Header */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{job.employer}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Posted {format(new Date(job.created_at), 'MMM d, yyyy')}</span>
              </div>
            </div>
            
            <Badge variant="secondary" className="flex items-center gap-2 text-lg p-3">
              <DollarSign className="h-5 w-5" />
              <span className="font-semibold">{formatSalary(job.salary)}</span>
            </Badge>
          </div>

          {/* Job Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Job Description</h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {job.description}
              </p>
            </div>
          </div>

          {/* Application Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">How to Apply</h3>
            {job.is_apply_link ? (
              <div className="space-y-3">
                <p className="text-muted-foreground">Click the button below to apply directly:</p>
                <Button onClick={handleApplyClick} size="lg" className="w-full sm:w-auto">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Apply Now
                </Button>
              </div>
            ) : (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Application Instructions:</h4>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {job.apply_info}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}