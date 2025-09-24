import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { ArrowLeft, MapPin, Clock, Phone, Mail, Globe, Users, Calendar, FileText, Image, Link, Images } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import PDFViewer from "@/components/PDFViewer";
import AnnouncementDialog from "@/components/AnnouncementDialog";
import { EventCard } from "@/components/EventCard";
import PhotoViewer from "@/components/PhotoViewer";

interface CivicOrganization {
  id: string;
  name: string;
  description: string;
  coverage_area: string;
  contact_info: any;
  meeting_info?: string;
  meeting_address?: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  photos?: string[];
  created_at: string;
}

interface Leader {
  id: string;
  name: string;
  title: string;
  contact_info: any;
  photo_url?: string;
  order_index: number;
}

interface Newsletter {
  id: string;
  title: string;
  file_path: string;
  upload_date: string;
}

interface ImportantLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  order_index: number;
  is_active: boolean;
}

interface GalleryPhoto {
  id: string;
  title?: string;
  description?: string;
  photo_url: string;
  order_index: number;
}

const CivicDetail = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [organization, setOrganization] = useState<CivicOrganization | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [leadership, setLeadership] = useState<Leader[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [importantLinks, setImportantLinks] = useState<ImportantLink[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [civicEvents, setCivicEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [selectedPDF, setSelectedPDF] = useState<{url: string; title: string} | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    if (orgId) {
      fetchOrganizationData();
    }
  }, [orgId]);

  const fetchOrganizationData = async () => {
    if (!orgId) return;

    try {
      // Fetch organization details
      const { data: orgData, error: orgError } = await supabase
        .from('civic_organizations')
        .select('*')
        .eq('id', orgId)
        .eq('is_active', true)
        .single();

      if (orgError) {
        console.error('Error fetching organization:', orgError);
        toast({
          title: "Error",
          description: "Organization not found",
          variant: "destructive",
        });
        navigate('/civics');
        return;
      }

      setOrganization(orgData);

      // Fetch announcements
      const { data: announcementsData } = await supabase
        .from('civic_announcements')
        .select('*')
        .eq('civic_org_id', orgId)
        .order('created_at', { ascending: false });

      setAnnouncements(announcementsData || []);

      // Fetch leadership
      const { data: leadershipData } = await supabase
        .from('civic_leadership')
        .select('*')
        .eq('civic_org_id', orgId)
        .order('order_index');

      setLeadership(leadershipData || []);

      // Fetch newsletters
      const { data: newslettersData } = await supabase
        .from('civic_newsletters')
        .select('*')
        .eq('civic_org_id', orgId)
        .order('upload_date', { ascending: false });

      setNewsletters(newslettersData || []);

      // Fetch important links
      const { data: linksData } = await supabase
        .from('civic_important_links')
        .select('*')
        .eq('civic_org_id', orgId)
        .eq('is_active', true)
        .order('order_index');

      setImportantLinks(linksData || []);

      // Fetch gallery photos
      const { data: galleryData } = await supabase
        .from('civic_gallery')
        .select('*')
        .eq('civic_org_id', orgId)
        .order('order_index');

      setGalleryPhotos(galleryData || []);

      // Fetch civic events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('civic_org_id', orgId)
        .eq('archived', false)
        .order('event_date', { ascending: true });

      setCivicEvents(eventsData || []);

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load organization data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage.from('civic-files').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleViewPDF = (newsletter: Newsletter) => {
    setSelectedPDF({
      url: getFileUrl(newsletter.file_path),
      title: newsletter.title
    });
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

  if (!organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Organization Not Found</h1>
            <Button onClick={() => navigate('/civics')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Organizations
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/civics')}
              className="mb-4 hover:bg-green-50 hover:text-green-600"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Organizations
            </Button>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {organization.name}
              </h1>
              <Badge variant="secondary" className="mb-4">
                <MapPin className="mr-1 h-3 w-3" />
                {organization.coverage_area}
              </Badge>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="general">General Info</TabsTrigger>
              <TabsTrigger value="newsletters">Newsletter</TabsTrigger>
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
              <TabsTrigger value="leadership">Leadership</TabsTrigger>
              <TabsTrigger value="links">Important Links</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>

            {/* General Information */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    About Our Organization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {organization.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Contact Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        {organization.contact_info?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <a href={`tel:${organization.contact_info.phone}`} className="hover:text-green-600">
                              {organization.contact_info.phone}
                            </a>
                          </div>
                        )}
                        {organization.contact_info?.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <a href={`mailto:${organization.contact_info.email}`} className="hover:text-green-600">
                              {organization.contact_info.email}
                            </a>
                          </div>
                        )}
                        {organization.contact_info?.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-3 w-3 text-muted-foreground" />
                            <a 
                              href={organization.contact_info.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-green-600"
                            >
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meeting Information */}
                    {(organization.meeting_info || organization.meeting_address) && (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Meeting Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          {organization.meeting_info && (
                            <div className="flex items-start gap-2">
                              <Clock className="h-3 w-3 text-muted-foreground mt-0.5" />
                              <span>{organization.meeting_info}</span>
                            </div>
                          )}
                          {organization.meeting_address && (
                            <div className="flex items-start gap-2">
                              <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                              <span>{organization.meeting_address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* How to Join */}
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold mb-2 text-green-800">How to Get Involved</h3>
                    <p className="text-sm text-green-700">
                      Interested in joining or learning more? Contact us using the information above or 
                      attend one of our meetings to see how you can contribute to your community.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Newsletter */}
            <TabsContent value="newsletters" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Newsletter Archive
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {newsletters.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No newsletters yet</h3>
                      <p className="text-muted-foreground">
                        Check back later for newsletter updates from this organization.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {newsletters.map((newsletter) => (
                        <div 
                          key={newsletter.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                        >
                          <div>
                            <h3 className="font-medium">{newsletter.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(newsletter.upload_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewPDF(newsletter)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            View PDF
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Announcements */}
            <TabsContent value="announcements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Announcements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {announcements.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No announcements yet</h3>
                      <p className="text-muted-foreground">
                        Check back later for announcements from this organization.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {announcements.map((announcement) => (
                        <Card 
                          key={announcement.id} 
                          className="cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200 border-2 hover:border-primary/20"
                          onClick={() => setSelectedAnnouncement(announcement)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-4">
                              <h3 className="font-semibold text-lg line-clamp-2 flex-1">
                                {announcement.title}
                              </h3>
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                {format(parseISO(announcement.created_at), 'MMM d')}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed mb-3">
                              {announcement.content}
                            </p>
                            
                            {/* Preview indicators */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {announcement.photos && announcement.photos.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Image className="h-3 w-3" />
                                    <span>{announcement.photos.length} photo{announcement.photos.length !== 1 ? 's' : ''}</span>
                                  </div>
                                )}
                              </div>
                              <span className="text-xs text-primary font-medium">
                                Click to read more →
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Leadership */}
            <TabsContent value="leadership" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Leadership Team
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leadership.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No leadership information yet</h3>
                      <p className="text-muted-foreground">
                        Check back later for leadership team information.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {leadership.map((leader) => (
                        <div key={leader.id} className="text-center p-4 border rounded-lg">
                          {leader.photo_url ? (
                            <img
                              src={getFileUrl(leader.photo_url)}
                              alt={leader.name}
                              className="w-24 h-24 mx-auto rounded-full object-cover mb-4"
                            />
                          ) : (
                            <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                              <Users className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <h3 className="font-semibold text-lg">{leader.name}</h3>
                          <p className="text-muted-foreground mb-3">{leader.title}</p>
                          
                          {leader.contact_info && (
                            <div className="space-y-1 text-sm">
                               {leader.contact_info.email && (
                                <div className="flex items-center justify-center gap-2">
                                  <Mail className="h-3 w-3" />
                                  <a 
                                    href={`mailto:${leader.contact_info.email}`}
                                    className="hover:text-green-600"
                                  >
                                    {leader.contact_info.email}
                                  </a>
                                </div>
                              )}
                              {leader.contact_info.phone && (
                                <div className="flex items-center justify-center gap-2">
                                  <Phone className="h-3 w-3" />
                                  <a 
                                    href={`tel:${leader.contact_info.phone}`}
                                    className="hover:text-green-600"
                                  >
                                    {leader.contact_info.phone}
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Important Links */}
            <TabsContent value="links" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    Important Links
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {importantLinks.length === 0 ? (
                    <div className="text-center py-8">
                      <Link className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No important links yet</h3>
                      <p className="text-muted-foreground">
                        Check back later for important links and resources.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {importantLinks.map((link) => (
                        <div 
                          key={link.id}
                          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{link.title}</h3>
                              {link.description && (
                                <p className="text-muted-foreground text-sm mb-3">
                                  {link.description}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(link.url, '_blank')}
                              className="ml-4"
                            >
                              Visit Link
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Gallery */}
            <TabsContent value="gallery" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Images className="h-5 w-5" />
                    Photo Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {galleryPhotos.length === 0 ? (
                    <div className="text-center py-8">
                      <Images className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No photos yet</h3>
                      <p className="text-muted-foreground">
                        Check back later for photo updates from this organization.
                      </p>
                    </div>
                   ) : (
                     <>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {galleryPhotos.map((photo, index) => (
                           <div 
                             key={photo.id} 
                             className="group relative overflow-hidden rounded-lg border cursor-pointer"
                             onClick={() => {
                               setViewerIndex(index);
                               setViewerOpen(true);
                             }}
                           >
                             <img
                               src={photo.photo_url}
                               alt={photo.title || 'Gallery photo'}
                               className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                             />
                             {(photo.title || photo.description) && (
                               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                                 <div className="p-4 text-white">
                                   {photo.title && (
                                     <h4 className="font-semibold text-sm mb-1">{photo.title}</h4>
                                   )}
                                   {photo.description && (
                                     <p className="text-xs opacity-90">{photo.description}</p>
                                   )}
                                 </div>
                               </div>
                             )}
                           </div>
                         ))}
                       </div>

                       <PhotoViewer
                         photos={galleryPhotos}
                         currentIndex={viewerIndex}
                         isOpen={viewerOpen}
                         onClose={() => setViewerOpen(false)}
                         onIndexChange={setViewerIndex}
                       />
                     </>
                   )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Events */}
            <TabsContent value="events" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {civicEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No events scheduled</h3>
                      <p className="text-muted-foreground">
                        Check back later for event updates from this organization.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {civicEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* PDF Viewer */}
      {selectedPDF && (
        <PDFViewer
          isOpen={!!selectedPDF}
          onClose={() => setSelectedPDF(null)}
          pdfUrl={selectedPDF.url}
          title={selectedPDF.title}
        />
      )}
      
      {/* Announcement Dialog */}
      <AnnouncementDialog
        announcement={selectedAnnouncement}
        isOpen={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
      />
    </div>
  );
};

export default CivicDetail;