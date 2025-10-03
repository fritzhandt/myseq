import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import CommunityAlertBanner from "@/components/CommunityAlertBanner";
import { useNavigate } from "react-router-dom";
import { Phone, MapPin } from "lucide-react";
import { TranslatedText } from "@/components/TranslatedText";

const precincts = [
  {
    number: "103",
    coverageArea: "Downtown Jamaica Business District, Hollis Park Gardens, Hollis, Lakewood, and Jamaica",
    address: "168-02 91st Ave, Jamaica, NY, 11432-5229",
    phone: "(718) 657-8195",
    commandingOfficer: "Deputy Inspector Ralph A. Clement",
    website: "https://www.nyc.gov/site/nypd/bureaus/patrol/precincts/103rd-precinct.page"
  },
  {
    number: "105",
    coverageArea: "Queens Village, Cambria Heights, Bellerose, Glen Oaks, Floral Park, and Bellaire",
    address: "92-08 222nd Street, Queens Village, NY, 11428-1474",
    phone: "(718) 776-9176",
    commandingOfficer: "Captain Douglas Moodie",
    website: "https://www.nyc.gov/site/nypd/bureaus/patrol/precincts/105th-precinct.page"
  },
  {
    number: "113",
    coverageArea: "Southeastern area of Jamaica, Queens, along with St. Albans, Hollis, S. Ozone Park, and Rochdale",
    address: "167-02 Baisley Blvd., Jamaica, NY, 11434-2511",
    phone: "(718) 712-1627",
    commandingOfficer: "Deputy Inspector Sean Claxton",
    website: "https://www.nyc.gov/site/nypd/bureaus/patrol/precincts/113th-precinct.page"
  },
  {
    number: "116",
    coverageArea: "Springfield Gardens, Brookville, Laurelton, and Rosedale",
    address: "244-04 North Conduit Avenue, Queens, NY 11422",
    phone: "(718) 610-4162",
    commandingOfficer: "Deputy Inspector Jean Sony Beauvoir",
    website: "https://www.nyc.gov/site/nypd/bureaus/patrol/precincts/116th-precinct.page"
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
            <Card key={precinct.number} className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
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
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground mb-2">
                        <TranslatedText contentKey="police_precincts.coverage_area" originalText="Coverage Area" />
                      </p>
                      <p className="text-muted-foreground mb-3">{precinct.coverageArea}</p>
                      <p className="font-medium text-foreground mt-3">
                        <TranslatedText contentKey="police_precincts.address" originalText="Address" />
                      </p>
                      <p className="text-muted-foreground">{precinct.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">
                        <TranslatedText contentKey="police_precincts.phone_community_affairs" originalText="Phone (Community Affairs - Non-Emergency)" />
                      </p>
                      <a 
                        href={`tel:${precinct.phone}`}
                        className="text-primary hover:underline"
                      >
                        {precinct.phone}
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t mt-auto">
                  <p className="text-sm text-muted-foreground mb-3">
                    <strong>
                      <TranslatedText 
                        contentKey="police_precincts.commanding_officer"
                        originalText="Commanding Officer:"
                      />
                    </strong> {precinct.commandingOfficer}
                  </p>
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => window.open(precinct.website, '_blank')}
                  >
                    <TranslatedText 
                      contentKey="police_precincts.more_information"
                      originalText="More Information"
                    />
                  </Button>
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