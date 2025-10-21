import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SkipLinks from "@/components/SkipLinks";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Building2, LogOut, Settings, Users, FileText, Megaphone, Link, Images, Calendar, BarChart3, MonitorSmartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CivicGeneralSettings from "@/components/CivicGeneralSettings";
import CivicAnnouncementsManager from "@/components/CivicAnnouncementsManager";
import CivicNewsletterManager from "@/components/CivicNewsletterManager";
import CivicLeadershipManager from "@/components/CivicLeadershipManager";
import CivicImportantLinksManager from "@/components/CivicImportantLinksManager";
import CivicGalleryManager from "@/components/CivicGalleryManager";
import { CivicEventsManager } from "@/components/CivicEventsManager";
import { CivicStats } from "@/components/CivicStats";

interface CivicSession {
  orgId: string;
  orgName: string;
}

const CivicAdmin = () => {
  const [session, setSession] = useState<CivicSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    document.title = "Civic Organization Admin - My SEQ";
  }, []);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const sessionToken = localStorage.getItem('civic_session_token');
      
      console.log('Checking authentication, session token:', sessionToken ? 'exists' : 'missing');
      
      if (!sessionToken) {
        navigate('/civic-auth');
        return;
      }

      console.log('Sending validation request with token:', sessionToken.substring(0, 10) + '...');

      // Validate session with secure edge function
      const response = await fetch(
        'https://qdqmhgwjupsoradhktzu.supabase.co/functions/v1/civic-auth?action=validate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcW1oZ3dqdXBzb3JhZGhrdHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzODY5NzQsImV4cCI6MjA3Mzk2Mjk3NH0.90wVzi9LjnGUlBtCEBw6XHKJkf2DY1e_nVq7sP0L_8o',
          },
          body: JSON.stringify({ session_token: sessionToken }),
        }
      );

      const data = await response.json();

      console.log('Validation response status:', response.ok, 'data:', data);

      if (!response.ok || data.error || !data.valid) {
        console.error('Session validation failed:', data.error);
        localStorage.removeItem('civic_session_token');
        localStorage.removeItem('civic_org_name');
        localStorage.removeItem('civic_org_id');
        toast({
          title: "Session Expired",
          description: data.error || "Please log in again",
          variant: "destructive",
        });
        navigate('/civic-auth');
        return;
      }

      console.log('Session validated successfully for:', data.org_name);

      setSession({
        orgId: data.org_id,
        orgName: data.org_name,
      });
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('civic_session_token');
      localStorage.removeItem('civic_org_name');
      localStorage.removeItem('civic_org_id');
      navigate('/civic-auth');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const sessionToken = localStorage.getItem('civic_session_token');
    
    if (sessionToken) {
      // Call logout endpoint to invalidate session
      try {
        await fetch(
          'https://qdqmhgwjupsoradhktzu.supabase.co/functions/v1/civic-auth?action=logout',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcW1oZ3dqdXBzb3JhZGhrdHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzODY5NzQsImV4cCI6MjA3Mzk2Mjk3NH0.90wVzi9LjnGUlBtCEBw6XHKJkf2DY1e_nVq7sP0L_8o',
            },
            body: JSON.stringify({ session_token: sessionToken }),
          }
        );
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    localStorage.removeItem('civic_session_token');
    localStorage.removeItem('civic_org_name');
    localStorage.removeItem('civic_org_id');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate('/civic-auth');
  };

  if (loading) {
    return (
      <>
        <SkipLinks />
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
          <header id="primary-navigation">
            <Navbar />
          </header>
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-muted rounded w-1/3"></div>
                <div className="h-64 bg-muted rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <SkipLinks />
      <header id="primary-navigation">
        <Navbar />
      </header>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">

      {/* Mobile Warning Banner */}
      {isMobile && (
        <Alert variant="destructive" className="rounded-none border-x-0 m-0">
          <MonitorSmartphone className="h-5 w-5" />
          <AlertTitle className="font-bold">Desktop Only</AlertTitle>
          <AlertDescription>
            The admin panel is optimized for desktop use only. Please use a desktop or laptop computer for the best experience.
          </AlertDescription>
        </Alert>
        )}
        
        <main id="main-content" className="container mx-auto px-4 py-8">
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
            <TabsList className="grid w-full grid-cols-8">
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
              <TabsTrigger value="links" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                Links
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <Images className="h-4 w-4" />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Stats
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

            {/* Important Links */}
            <TabsContent value="links">
              <CivicImportantLinksManager orgId={session.orgId} />
            </TabsContent>

            {/* Gallery */}
            <TabsContent value="gallery">
              <CivicGalleryManager orgId={session.orgId} />
            </TabsContent>

            {/* Events */}
            <TabsContent value="events">
              <CivicEventsManager civicOrgId={session.orgId} />
            </TabsContent>

            {/* Stats */}
            <TabsContent value="stats">
              <CivicStats orgId={session.orgId} />
            </TabsContent>
          </Tabs>
        </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default CivicAdmin;