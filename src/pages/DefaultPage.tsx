import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import CommunityAlertBanner from "@/components/CommunityAlertBanner";
import { Calendar, Users, Briefcase, ArrowRight, MapPin, Heart } from "lucide-react";

export default function DefaultPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <CommunityAlertBanner />
      
      <main className="relative">
        {/* Hero Section */}
        <section className="relative py-16 px-4 text-center overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-secondary rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 left-20 w-40 h-40 bg-accent rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-medium mb-6">
                <MapPin className="h-4 w-4" />
                Southeast Queens, NYC
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent font-oswald uppercase tracking-tight">
                Your Community
                <br />
                <span className="text-primary">Starts Here</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-0 max-w-2xl mx-auto leading-relaxed">
                Discover events, connect with neighbors, find opportunities, and build stronger communities in Southeast Queens
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="pt-4 pb-20 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Events Card */}
              <Card className="group relative overflow-hidden border-2 hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:scale-105 bg-gradient-to-br from-background to-primary/5 flex flex-col h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10 pb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2 group-hover:text-primary transition-colors duration-300">
                    Community Events
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Local happenings, town halls, and community gatherings in Southeast Queens
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 mt-auto">
                  <Button 
                    className="w-full group-hover:bg-primary group-hover:text-white transition-all duration-300" 
                    variant="outline"
                    onClick={() => window.location.href = '/home'}
                  >
                    Discover Events
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>

              {/* Resources Card */}
              <Card className="group relative overflow-hidden border-2 hover:border-secondary/20 transition-all duration-500 hover:shadow-2xl hover:scale-105 bg-gradient-to-br from-background to-secondary/5 flex flex-col h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10 pb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/70 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2 group-hover:text-secondary transition-colors duration-300">
                    Community Resources
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Local organizations, services, and support networks for our community
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 mt-auto">
                  <Button 
                    className="w-full group-hover:bg-secondary group-hover:text-white transition-all duration-300" 
                    variant="outline"
                    onClick={() => window.location.href = '/resources'}
                  >
                    Browse Resources
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>

              {/* Jobs Card */}
              <Card className="group relative overflow-hidden border-2 hover:border-accent/20 transition-all duration-500 hover:shadow-2xl hover:scale-105 bg-gradient-to-br from-background to-accent/5 flex flex-col h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10 pb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2 group-hover:text-accent transition-colors duration-300">
                    Career Opportunities
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Employment opportunities and career development resources locally
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 mt-auto">
                  <Button 
                    className="w-full group-hover:bg-accent group-hover:text-white transition-all duration-300" 
                    variant="outline"
                    onClick={() => window.location.href = '/jobs'}
                  >
                    Find Opportunities
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4 text-center">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-oswald uppercase tracking-wide">
              Questions? Contact Your Elected Officials
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Have concerns about community issues or need assistance with local services? Reach out to your elected representatives who can help address your needs and advocate for our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => window.location.href = '/contact-elected'}
              >
                Contact Your Elected
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}