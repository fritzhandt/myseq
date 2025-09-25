import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { Users, MapPin, Search, Vote, ExternalLink, Phone, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CivicOrganization {
  id: string;
  name: string;
  description: string;
  coverage_area: string;
  contact_info: any;
  meeting_info?: string;
  meeting_address?: string;
  created_at: string;
}

const Civics = () => {
  const [organizations, setOrganizations] = useState<CivicOrganization[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<CivicOrganization[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Handle AI navigation state for civic search  
  useEffect(() => {
    const state = location.state as any;
    if (state?.searchTerm) {
      setSearchQuery(state.searchTerm);
      // Clear the navigation state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = organizations.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.coverage_area.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOrgs(filtered);
    } else {
      setFilteredOrgs(organizations);
    }
  }, [searchQuery, organizations]);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('civic_organizations')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching organizations:', error);
        toast({
          title: "Error",
          description: "Failed to load civic organizations",
          variant: "destructive",
        });
        return;
      }

      setOrganizations(data || []);
      setFilteredOrgs(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrgClick = (orgId: string) => {
    navigate(`/civics/${orgId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar />
      
      {/* Back to Main Menu */}
      <div className="bg-muted/50 border-b">
        <div className="container mx-auto px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/'}
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Main Menu
          </Button>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Civic Organizations
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with local civic organizations in Southeast Queens. Find meeting information, 
              announcements, and ways to get involved in your community.
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations or coverage areas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Organizations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredOrgs.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Vote className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchQuery ? "No organizations found" : "No organizations yet"}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? "Try adjusting your search terms" 
                    : "Check back later for civic organizations in your area"
                  }
                </p>
              </div>
            ) : (
              filteredOrgs.map((org) => (
                <Card 
                  key={org.id} 
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-green-500/20"
                >
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-2">
                      <span className="group-hover:text-green-600 transition-colors">
                        {org.name}
                      </span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-green-600 transition-colors flex-shrink-0" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Coverage Area */}
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Coverage Area</p>
                        <p className="text-sm text-muted-foreground">{org.coverage_area}</p>
                      </div>
                    </div>
                    
                    {/* Meeting Information */}
                    {org.meeting_info && (
                      <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Meetings</p>
                          <p className="text-sm text-muted-foreground">{org.meeting_info}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Phone Number */}
                    {org.contact_info?.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 mt-0.5 text-purple-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Phone</p>
                          <p className="text-sm text-muted-foreground">{org.contact_info.phone}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* View Page Button */}
                    <Button 
                      className="w-full mt-4"
                      variant="outline"
                      onClick={() => handleOrgClick(org.id)}
                    >
                      View Page
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Admin Access */}
          <div className="text-center mt-12 pt-8 border-t">
            <p className="text-muted-foreground mb-4">
              Are you a civic organization looking to join our platform?
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/civic-auth')}
              className="hover:bg-green-50 hover:border-green-500 hover:text-green-600"
            >
              <Vote className="mr-2 h-4 w-4" />
              Organization Access
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Civics;