import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, DollarSign, ExternalLink, Info } from 'lucide-react';

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

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const formatSalary = (salary: string) => {
    // Add dollar signs to numbers in the salary string
    return salary.replace(/(\d+)/g, '$$$1');
  };

  const handleApplyClick = () => {
    if (job.is_apply_link) {
      // Open the link in a new tab
      window.open(job.apply_info, '_blank');
    } else {
      // For non-link applications, we could show an alert or handle differently
      alert(`Application Instructions: ${job.apply_info}`);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                <span>{job.employer}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            <span>{formatSalary(job.salary)}</span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-end">
          <Button onClick={handleApplyClick} size="sm">
            {job.is_apply_link ? (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Apply Now
              </>
            ) : (
              'Application Info'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}