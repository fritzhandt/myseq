import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import CommunityAlertBanner from "@/components/CommunityAlertBanner";
import { Calendar, Users, MapPin, Clock, ArrowRight } from "lucide-react";

export default function DefaultPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CommunityAlertBanner />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to Your <span className="text-primary">Civic Hub</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto mb-12">
            Discover community events, connect with local resources, and stay informed about what's happening in your area.
          </p>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Events Section */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <CardTitle className="text-2xl mb-2">Community Events</CardTitle>
              <CardDescription className="text-base">
                Find local events, meetings, and activities happening in your community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => window.location.href = '/home'}
              >
                Explore Events
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Resources Section */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-secondary/20">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:text-secondary transition-colors" />
              </div>
              <CardTitle className="text-2xl mb-2">Community Resources</CardTitle>
              <CardDescription className="text-base">
                Discover local organizations, services, and support available in your community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                variant="secondary"
                className="w-full"
                onClick={() => window.location.href = '/resources'}
              >
                Browse Resources
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}