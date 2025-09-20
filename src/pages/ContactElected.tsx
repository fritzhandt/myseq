import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Phone, Mail, MapPin, User } from 'lucide-react';
import Navbar from '@/components/Navbar';

const ContactElected = () => {
  const navigate = useNavigate();

  const electedOfficials = [
    {
      name: "Hon. Adrienne Adams",
      title: "Council Speaker",
      district: "District 28",
      phone: "(718) 206-2068",
      email: "speakeradams@council.nyc.gov",
      address: "213-10 Hillside Avenue, Queens Village, NY 11427",
      office: "NYC Council"
    },
    {
      name: "Hon. Nantasha Williams", 
      title: "Assemblymember",
      district: "District 27",
      phone: "(718) 723-5412",
      email: "williamsn@nyassembly.gov",
      address: "142-15 Rockaway Blvd, Jamaica, NY 11436",
      office: "NYS Assembly"
    },
    {
      name: "Hon. Leroy Comrie",
      title: "State Senator", 
      district: "District 14",
      phone: "(718) 765-3925",
      email: "lcomrie@nysenate.gov",
      address: "113-43 Farmers Blvd, St. Albans, NY 11412",
      office: "NYS Senate"
    },
    {
      name: "Hon. Gregory Meeks",
      title: "U.S. Representative",
      district: "5th Congressional District", 
      phone: "(718) 725-6000",
      email: "info@meeks.house.gov",
      address: "153-01 Jamaica Avenue, Jamaica, NY 11432",
      office: "U.S. House of Representatives"
    },
    {
      name: "Hon. Chuck Schumer",
      title: "U.S. Senator",
      district: "New York State",
      phone: "(718) 542-5420", 
      email: "senator@schumer.senate.gov",
      address: "15 Henry Street, Hempstead, NY 11550",
      office: "U.S. Senate"
    },
    {
      name: "Hon. Kirsten Gillibrand",
      title: "U.S. Senator", 
      district: "New York State",
      phone: "(518) 431-0120",
      email: "gillibrand.senate.gov/contact",
      address: "Leo W. O'Brien Federal Building, Albany, NY 12207",
      office: "U.S. Senate"
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
            
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-6">Contact Your Elected Officials</h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Reach out to your representatives to share your thoughts, concerns, and ideas. 
                Your voice matters in shaping the policies that affect Southeast Queens.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {electedOfficials.map((official, index) => (
                <Card key={index} className="h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center mb-2">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{official.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{official.office}</p>
                      </div>
                    </div>
                    <div className="bg-muted/50 px-3 py-2 rounded-md">
                      <p className="text-sm font-medium">{official.title}</p>
                      <p className="text-xs text-muted-foreground">{official.district}</p>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Phone className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <a 
                          href={`tel:${official.phone}`}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {official.phone}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Mail className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <a 
                          href={`mailto:${official.email}`}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors break-all"
                        >
                          {official.email}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Office Address</p>
                        <p className="text-sm text-muted-foreground">
                          {official.address}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 bg-muted p-8 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Tips for Contacting Your Representatives</h2>
              <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Be Clear and Concise</h3>
                  <p>State your position clearly and include specific details about how the issue affects you and your community.</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">Include Your Address</h3>
                  <p>Always include your full address to verify you're a constituent in their district.</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">Follow Up</h3>
                  <p>If you don't receive a response within 2-3 weeks, it's appropriate to follow up politely.</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">Be Respectful</h3>
                  <p>Maintain a professional and respectful tone, even when discussing contentious issues.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactElected;