import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';

const ElectedOfficials = () => {
  const navigate = useNavigate();
  const officials = [
    {
      name: "Sample Assembly Member",
      title: "New York State Assembly",
      district: "District XX",
      bio: "This is a placeholder for your local Assembly Member's biography and contact information.",
      image: "/placeholder.svg"
    },
    {
      name: "Sample Senator",
      title: "New York State Senate", 
      district: "District XX",
      bio: "This is a placeholder for your local Senator's biography and contact information.",
      image: "/placeholder.svg"
    },
    {
      name: "Sample Council Member",
      title: "New York City Council",
      district: "District XX", 
      bio: "This is a placeholder for your local Council Member's biography and contact information.",
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <h1 className="text-4xl font-bold mb-8 text-center">Your Elected Officials</h1>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Meet the representatives who serve your community. These officials work to address 
            local concerns and represent your interests at different levels of government.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {officials.map((official, index) => (
              <div key={index} className="bg-card p-6 rounded-lg border shadow-sm">
                <div className="text-center mb-4">
                  <img
                    src={official.image}
                    alt={official.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover bg-muted"
                  />
                  <h2 className="text-xl font-semibold mb-1">{official.name}</h2>
                  <p className="text-primary font-medium">{official.title}</p>
                  <p className="text-sm text-muted-foreground">{official.district}</p>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {official.bio}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <div className="bg-muted p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Note</h2>
              <p className="text-muted-foreground">
                This page shows placeholder information. To display your actual elected officials, 
                please update this page with the correct names, photos, and biographical information 
                for your specific district representatives.
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectedOfficials;