import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
const MyElectedLookup = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<{title: string, url: string} | null>(null);
  
  const lookupOptions = [
    {
      title: "Assemblymember",
      description: "Find your New York State Assembly representative",
      url: "https://nyassembly.gov/mem/search/",
      sealUrl: "/seals/ny-assembly.jpeg"
    },
    {
      title: "Senator", 
      description: "Find your New York State Senate representative",
      url: "https://www.nysenate.gov/find-my-senator",
      sealUrl: "/seals/ny-senate.jpg"
    },
    {
      title: "Councilmember",
      description: "Find your New York City Council representative", 
      url: "https://council.nyc.gov/districts/",
      sealUrl: "/seals/nyc-council.svg"
    },
    {
      title: "Congressperson",
      description: "Find your U.S. House of Representatives member",
      url: "https://www.house.gov/representatives/find-your-representative",
      sealUrl: "/seals/us-house.png"
    }
  ];

  const handleLookupClick = (option: {title: string, url: string}) => {
    setSelectedOption(option);
    setIsDialogOpen(true);
  };

  const handleProceed = () => {
    if (selectedOption) {
      window.open(selectedOption.url, '_blank', 'noopener,noreferrer');
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <h1 className="text-4xl font-bold mb-8 text-center">My Elected Lookup</h1>
            <p className="text-lg text-muted-foreground text-center mb-12">
              Use these tools to find and contact your elected representatives at different levels of government. Each tool will take you to the official website where you can search by your address or zip code.
            </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {lookupOptions.map((option, index) => (
              <div key={index} className="bg-card p-6 rounded-lg border shadow-sm flex flex-col">
                <div className="text-center mb-6 flex-1">
                  <div className="w-20 h-20 mx-auto mb-4">
                    <img 
                      src={option.sealUrl} 
                      alt={`${option.title} Seal`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">{option.title}</h2>
                  <p className="text-sm text-muted-foreground mb-6">{option.description}</p>
                </div>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => handleLookupClick(option)}
                      className="w-full h-11"
                      size="lg"
                    >
                      Search
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Leaving This Site</DialogTitle>
                      <DialogDescription className="text-left">
                        This link is taking you to an official government website:
                        <br />
                        <strong>{selectedOption?.url}</strong>
                        <br /><br />
                        This is an official government website maintained by the respective office. Your information will be handled securely according to their privacy policies.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleProceed}>
                        Continue to External Site
                        <ExternalLink className="ml-2 w-4 h-4" />
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
          
          <div className="mt-12 bg-muted p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <ExternalLink className="mr-2 w-5 h-5" />
              External Links Notice
            </h2>
            <p className="text-muted-foreground text-sm">
              The lookup tools above will redirect you to official government websites. These external sites are maintained by the respective government offices and contain the most up-to-date information about your representatives.
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyElectedLookup;