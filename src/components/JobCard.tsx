import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, DollarSign, ExternalLink, Info, Clock } from 'lucide-react';

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
      // Open the link in a new tab
      window.open(job.apply_info, '_blank');
    } else {
      // For non-link applications, we could show an alert or handle differently
      alert(`Application Instructions: ${job.apply_info}`);
    }
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-l-4 border-l-primary/20 hover:border-l-primary bg-gradient-to-r from-card to-card/50">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative pb-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200 leading-tight">
                {job.title}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <Building className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-base font-medium text-muted-foreground">{job.employer}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">{job.location}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                <span>{formatDate(job.created_at)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge 
              variant="secondary" 
              className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-0 font-semibold px-3 py-1"
            >
              <DollarSign className="h-3 w-3 mr-1" />
              {formatSalary(job.salary)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative pt-0">
        {job.description && (
          <div className="mb-4 p-3 bg-muted/30 rounded-lg border-l-2 border-l-primary/30">
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {job.description}
            </p>
          </div>
        )}
        
        <div className="flex justify-end">
          <Button 
            onClick={handleApplyClick} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-semibold"
            size="sm"
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
        </div>
      </CardContent>
    </Card>
  );
}