import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { Building2, LogOut, Settings, Users, FileText, Megaphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CivicGeneralSettings from "@/components/CivicGeneralSettings";
import CivicAnnouncementsManager from "@/components/CivicAnnouncementsManager";
import CivicNewsletterManager from "@/components/CivicNewsletterManager";
import CivicLeadershipManager from "@/components/CivicLeadershipManager";

interface CivicSession {
  orgId: string;
  orgName: string;
  expires: number;
}

const CivicAdmin = () => {
  const [session, setSession] = useState<CivicSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const civicSession = localStorage.getItem('civic_session');
      
      if (!civicSession) {
        navigate('/civic-auth');
        return;
      }

      const parsedSession = JSON.parse(civicSession);
      
      // Check if session is expired
      if (parsedSession.expires <= Date.now()) {
        localStorage.removeItem('civic_session');
        toast({
          title: "Session Expired",
          description: "Please log in again",
          variant: "destructive",
        });
        navigate('/civic-auth');
        return;
      }

      // Verify organization still exists and is active
      const { data: org, error } = await supabase
        .from('civic_organizations')
        .select('id, name, is_active')
        .eq('id', parsedSession.orgId)
        .eq('is_active', true)
        .single();

      if (error || !org) {
        localStorage.removeItem('civic_session');
        toast({
          title: "Access Denied",
          description: "Organization not found or inactive",
          variant: "destructive",
        });
        navigate('/civic-auth');
        return;
      }

      setSession(parsedSession);
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('civic_session');
      navigate('/civic-auth');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('civic_session');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate('/civic-auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {session.orgName}
              </h1>
              <p className="text-muted-foreground">Organization Admin Panel</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/civics/${session.orgId}`)}
                className="hover:bg-green-50 hover:border-green-500 hover:text-green-600"
              >
                <Building2 className="mr-2 h-4 w-4" />
                View Public Page
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="hover:bg-red-50 hover:border-red-500 hover:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* Admin Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="announcements" className="flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                Announcements
              </TabsTrigger>
              <TabsTrigger value="newsletters" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Newsletter
              </TabsTrigger>
              <TabsTrigger value="leadership" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Leadership
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <CivicGeneralSettings orgId={session.orgId} />
            </TabsContent>

            {/* Announcements */}
            <TabsContent value="announcements">
              <CivicAnnouncementsManager orgId={session.orgId} />
            </TabsContent>

            {/* Newsletter */}
            <TabsContent value="newsletters">
              <CivicNewsletterManager orgId={session.orgId} />
            </TabsContent>

            {/* Leadership */}
            <TabsContent value="leadership">
              <CivicLeadershipManager orgId={session.orgId} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default CivicAdmin;