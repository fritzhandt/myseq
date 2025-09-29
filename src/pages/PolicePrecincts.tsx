import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import CommunityAlertBanner from "@/components/CommunityAlertBanner";
import { useNavigate } from "react-router-dom";
import { Phone, MapPin, Clock } from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";

const precincts = [
  {
    number: "103",
    address: "168-02 91st Avenue, Jamaica, NY 11432",
    phone: "(718) 657-8181",
    commandingOfficer: "Deputy Inspector",
    hours: "24 Hours"
  },
  {
    number: "105",
    address: "92-08 222nd Street, Queens Village, NY 11428",
    phone: "(718) 776-9090",
    commandingOfficer: "Deputy Inspector",
    hours: "24 Hours"
  },
  {
    number: "113",
    address: "167-02 Baisley Boulevard, Jamaica, NY 11434",
    phone: "(718) 712-7733",
    commandingOfficer: "Deputy Inspector",
    hours: "24 Hours"
  },
  {
    number: "116",
    address: "92-24 Rockaway Beach Boulevard, Rockaway Beach, NY 11693",
    phone: "(718) 318-4200",
    commandingOfficer: "Deputy Inspector",
    hours: "24 Hours"
  }
];

export default function PolicePrecincts() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CommunityAlertBanner />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <TranslatedText contentKey="police_precincts.back_to_home" originalText="← Back to Home" />
          </Button>
          
          <div className="text-center mb-8">
            <TranslatedText 
              contentKey="police_precincts.title"
              originalText="Police Precincts"
              as="h1"
              className="text-4xl font-bold text-foreground mb-4 font-oswald uppercase tracking-wide"
            />
            <TranslatedText 
              contentKey="police_precincts.subtitle"
              originalText="Contact information for NYPD precincts serving Southeast Queens"
              as="p"
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {precincts.map((precinct) => (
            <Card key={precinct.number} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary">
                  <TranslatedText 
                    contentKey={`police_precincts.precinct_${precinct.number}_title`}
                    originalText={`${precinct.number}th Precinct`}
                  />
                </CardTitle>
                <CardDescription className="text-base">
                  <TranslatedText 
                    contentKey="police_precincts.nypd_southeast_queens"
                    originalText="NYPD - Southeast Queens"
                  />
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      <TranslatedText contentKey="police_precincts.address" originalText="Address" />
                    </p>
                    <p className="text-muted-foreground">{precinct.address}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      <TranslatedText contentKey="police_precincts.phone" originalText="Phone" />
                    </p>
                    <a 
                      href={`tel:${precinct.phone}`}
                      className="text-primary hover:underline"
                    >
                      {precinct.phone}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      <TranslatedText contentKey="police_precincts.hours" originalText="Hours" />
                    </p>
                    <p className="text-muted-foreground">
                      <TranslatedText 
                        contentKey="police_precincts.24_hours"
                        originalText={precinct.hours}
                      />
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>
                      <TranslatedText 
                        contentKey="police_precincts.commanding_officer"
                        originalText="Commanding Officer:"
                      />
                    </strong> <TranslatedText 
                      contentKey="police_precincts.deputy_inspector"
                      originalText={precinct.commandingOfficer}
                    />
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-muted/50 rounded-lg p-6">
          <TranslatedText 
            contentKey="police_precincts.emergency_info_title"
            originalText="Emergency Information"
            as="h2"
            className="text-xl font-semibold mb-4 text-foreground"
          />
          <div className="space-y-2 text-muted-foreground">
            <p>
              <strong>
                <TranslatedText contentKey="police_precincts.emergency" originalText="Emergency:" />
              </strong> <TranslatedText contentKey="police_precincts.call_911" originalText="Call 911" />
            </p>
            <p>
              <strong>
                <TranslatedText contentKey="police_precincts.non_emergency" originalText="Non-Emergency:" />
              </strong> <TranslatedText contentKey="police_precincts.call_311" originalText="Call 311 or (212) 639-9675" />
            </p>
            <p>
              <strong>
                <TranslatedText contentKey="police_precincts.crime_stoppers" originalText="Crime Stoppers:" />
              </strong> 1-800-577-TIPS (8477)
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}