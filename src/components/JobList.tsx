import JobCard from './JobCard';

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

interface JobListProps {
  jobs: Job[];
  loading: boolean;
  isSearching?: boolean;
}

export default function JobList({ jobs, loading, isSearching = false }: JobListProps) {

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-card rounded-lg p-6 border">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
              <div className="h-4 bg-muted rounded w-20"></div>
            </div>
            <div className="flex gap-4 mb-4">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 bg-muted rounded w-32"></div>
            </div>
            <div className="h-10 bg-muted rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    if (isSearching) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Searching...</h3>
          <p className="text-muted-foreground">Finding the best job matches for you.</p>
        </div>
      );
    }
    
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No jobs found</h3>
        <p className="text-muted-foreground">Try adjusting your search criteria or check back later for new opportunities.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
        />
      ))}
    </div>
  );
}