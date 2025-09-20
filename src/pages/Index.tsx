import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">App is Working</h1>
        <p className="text-muted-foreground mb-6">Basic routing is functional</p>
        <div className="flex flex-col gap-3 max-w-sm mx-auto">
          <Link 
            to="/home" 
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Home (Test Events)
          </Link>
          <Link 
            to="/special-event" 
            className="inline-block px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Special Events (Phase 5 Test)
          </Link>
          <Link 
            to="/admin" 
            className="inline-block px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
