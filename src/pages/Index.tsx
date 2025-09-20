import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">App is Working</h1>
        <p className="text-muted-foreground mb-6">Basic routing is functional</p>
        <Link 
          to="/home" 
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go to Home (Test Events)
        </Link>
      </div>
    </div>
  );
};

export default Index;
