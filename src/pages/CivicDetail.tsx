import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import AdminPagination from "@/components/AdminPagination";
import { ArrowLeft, MapPin, Clock, Phone, Mail, Globe, Users, Calendar, FileText, Image, Link, Images } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import PDFViewer from "@/components/PDFViewer";
import AnnouncementDialog from "@/components/AnnouncementDialog";
import { EventCard } from "@/components/EventCard";
import PhotoViewer from "@/components/PhotoViewer";
import { TranslatedText } from "@/components/TranslatedText";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useTranslation } from "@/contexts/TranslationContext";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const { trackPageView, trackTabView, trackContentClick } = useAnalytics();
  const { currentLanguage } = useTranslation();
  const isMobile = useIsMobile();
  
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
  
  // Pagination states
  const [announcementsPage, setAnnouncementsPage] = useState(1);
  const [newslettersPage, setNewslettersPage] = useState(1);
  const [galleryPage, setGalleryPage] = useState(1);
  const [eventsPage, setEventsPage] = useState(1);
  const itemsPerPage = 6;

  // Track page view on mount
  useEffect(() => {
    if (orgId) {
      trackPageView(`/civics/${orgId}`, orgId, currentLanguage);
      fetchOrganizationData();
    }
  }, [orgId]);

  // Track tab changes
  useEffect(() => {
    if (orgId && activeTab !== "general") {
      trackTabView(activeTab, orgId);
    }
  }, [activeTab, orgId]);

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
    trackContentClick('newsletter', newsletter.id, orgId);
    setSelectedPDF({
      url: getFileUrl(newsletter.file_path),
      title: newsletter.title
    });
  };

  // Pagination calculations
  const paginatedAnnouncements = announcements.slice(
    (announcementsPage - 1) * itemsPerPage,
    announcementsPage * itemsPerPage
  );
  const paginatedNewsletters = newsletters.slice(
    (newslettersPage - 1) * itemsPerPage,
    newslettersPage * itemsPerPage
  );
  const paginatedGallery = galleryPhotos.slice(
    (galleryPage - 1) * itemsPerPage,
    galleryPage * itemsPerPage
  );
  const paginatedEvents = civicEvents.slice(
    (eventsPage - 1) * itemsPerPage,
    eventsPage * itemsPerPage
  );

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
            <TranslatedText 
              contentKey="civic_detail.not_found" 
              originalText="Organization Not Found"
              as="h1"
              className="text-2xl font-bold mb-4"
            />
            <Button onClick={() => navigate('/civics')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              <TranslatedText contentKey="civic_detail.back_to_orgs" originalText="Back to Organizations" />
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
              <TranslatedText contentKey="civic_detail.back_button" originalText="Back to Organizations" />
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
            {isMobile ? (
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full mb-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">
                    <TranslatedText contentKey="civic_detail.tab_general" originalText="General Info" />
                  </SelectItem>
                  <SelectItem value="newsletters">
                    <TranslatedText contentKey="civic_detail.tab_newsletter" originalText="Newsletter" />
                  </SelectItem>
                  <SelectItem value="announcements">
                    <TranslatedText contentKey="civic_detail.tab_announcements" originalText="Announcements" />
                  </SelectItem>
                  <SelectItem value="leadership">
                    <TranslatedText contentKey="civic_detail.tab_leadership" originalText="Leadership" />
                  </SelectItem>
                  <SelectItem value="links">
                    <TranslatedText contentKey="civic_detail.tab_links" originalText="Important Links" />
                  </SelectItem>
                  <SelectItem value="gallery">
                    <TranslatedText contentKey="civic_detail.tab_gallery" originalText="Gallery" />
                  </SelectItem>
                  <SelectItem value="events">
                    <TranslatedText contentKey="civic_detail.tab_events" originalText="Events" />
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="general"><TranslatedText contentKey="civic_detail.tab_general" originalText="General Info" /></TabsTrigger>
                <TabsTrigger value="newsletters"><TranslatedText contentKey="civic_detail.tab_newsletter" originalText="Newsletter" /></TabsTrigger>
                <TabsTrigger value="announcements"><TranslatedText contentKey="civic_detail.tab_announcements" originalText="Announcements" /></TabsTrigger>
                <TabsTrigger value="leadership"><TranslatedText contentKey="civic_detail.tab_leadership" originalText="Leadership" /></TabsTrigger>
                <TabsTrigger value="links"><TranslatedText contentKey="civic_detail.tab_links" originalText="Important Links" /></TabsTrigger>
                <TabsTrigger value="gallery"><TranslatedText contentKey="civic_detail.tab_gallery" originalText="Gallery" /></TabsTrigger>
                <TabsTrigger value="events"><TranslatedText contentKey="civic_detail.tab_events" originalText="Events" /></TabsTrigger>
              </TabsList>
            )}

            {/* General Information */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <TranslatedText contentKey="civic_detail.about_title" originalText="About Our Organization" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TranslatedText 
                    contentKey={`civic_detail.org_${organization.id}_description`}
                    originalText={organization.description}
                    as="p"
                    className="text-muted-foreground leading-relaxed mb-6"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div>
                      <h3 className="font-semibold mb-3">
                        <TranslatedText contentKey="civic_detail.contact_title" originalText="Contact Information" />
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
                              <TranslatedText contentKey="civic_detail.website_link" originalText="Website" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meeting Information */}
                    {(organization.meeting_info || organization.meeting_address) && (
                      <div>
                        <h3 className="font-semibold mb-3">
                          <TranslatedText contentKey="civic_detail.meeting_title" originalText="Meeting Information" />
                        </h3>
                        <div className="space-y-2 text-sm">
                          {organization.meeting_info && (
                            <div className="flex items-start gap-2">
                              <Clock className="h-3 w-3 text-muted-foreground mt-0.5" />
                              <TranslatedText 
                                contentKey={`civic_detail.org_${organization.id}_meeting_info`}
                                originalText={organization.meeting_info}
                                as="span"
                              />
                            </div>
                          )}
                          {organization.meeting_address && (
                            <div className="flex items-start gap-2">
                              <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                              <TranslatedText 
                                contentKey={`civic_detail.org_${organization.id}_meeting_address`}
                                originalText={organization.meeting_address}
                                as="span"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* How to Join */}
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <TranslatedText 
                      contentKey="civic_detail.how_to_join_title" 
                      originalText="How to Get Involved"
                      as="h3"
                      className="font-semibold mb-2 text-green-800"
                    />
                    <TranslatedText 
                      contentKey="civic_detail.how_to_join_text" 
                      originalText="Interested in joining or learning more? Contact us using the information above or attend one of our meetings to see how you can contribute to your community."
                      as="p"
                      className="text-sm text-green-700"
                    />
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
                    <TranslatedText contentKey="civic_detail.newsletter_archive" originalText="Newsletter Archive" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {newsletters.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <TranslatedText 
                        contentKey="civic_detail.no_newsletters_title" 
                        originalText="No newsletters yet"
                        as="h3"
                        className="text-lg font-semibold mb-2"
                      />
                      <TranslatedText 
                        contentKey="civic_detail.no_newsletters_text" 
                        originalText="Check back later for newsletter updates from this organization."
                        as="p"
                        className="text-muted-foreground"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {paginatedNewsletters.map((newsletter) => (
                        <div 
                          key={newsletter.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                        >
                          <div>
                            <TranslatedText 
                              contentKey={`civic_detail.newsletter_${newsletter.id}_title`}
                              originalText={newsletter.title}
                              as="h3"
                              className="font-medium"
                            />
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
                            <TranslatedText contentKey="civic_detail.view_pdf" originalText="View PDF" />
                          </Button>
                        </div>
                        ))}
                      </div>
                      
                      {newsletters.length > itemsPerPage && (
                        <div className="mt-6">
                          <AdminPagination
                            currentPage={newslettersPage}
                            totalPages={Math.ceil(newsletters.length / itemsPerPage)}
                            totalItems={newsletters.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setNewslettersPage}
                          />
                        </div>
                      )}
                    </>
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
                    <TranslatedText contentKey="civic_detail.announcements_title" originalText="Recent Announcements" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {announcements.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <TranslatedText 
                        contentKey="civic_detail.no_announcements_title" 
                        originalText="No announcements yet"
                        as="h3"
                        className="text-lg font-semibold mb-2"
                      />
                      <TranslatedText 
                        contentKey="civic_detail.no_announcements_text" 
                        originalText="Check back later for announcements from this organization."
                        as="p"
                        className="text-muted-foreground"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-4">
                        {paginatedAnnouncements.map((announcement) => (
                        <Card 
                          key={announcement.id} 
                          className="cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200 border-2 hover:border-primary/20"
                          onClick={() => {
                            trackContentClick('announcement', announcement.id, orgId);
                            setSelectedAnnouncement(announcement);
                          }}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-4">
                              <TranslatedText 
                                contentKey={`civic_detail.announcement_${announcement.id}_title`}
                                originalText={announcement.title}
                                as="h3"
                                className="font-semibold text-lg line-clamp-2 flex-1"
                              />
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                {format(parseISO(announcement.created_at), 'MMM d')}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <TranslatedText 
                              contentKey={`civic_detail.announcement_${announcement.id}_content`}
                              originalText={announcement.content}
                              as="p"
                              className="text-muted-foreground line-clamp-3 text-sm leading-relaxed mb-3"
                            />
                            
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
                                <TranslatedText contentKey="civic_detail.click_read_more" originalText="Click to read more →" />
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                        ))}
                      </div>
                      
                      {announcements.length > itemsPerPage && (
                        <div className="mt-6">
                          <AdminPagination
                            currentPage={announcementsPage}
                            totalPages={Math.ceil(announcements.length / itemsPerPage)}
                            totalItems={announcements.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setAnnouncementsPage}
                          />
                        </div>
                      )}
                    </>
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
                    <TranslatedText contentKey="civic_detail.leadership_title" originalText="Leadership Team" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leadership.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <TranslatedText 
                        contentKey="civic_detail.no_leadership_title" 
                        originalText="No leadership information yet"
                        as="h3"
                        className="text-lg font-semibold mb-2"
                      />
                      <TranslatedText 
                        contentKey="civic_detail.no_leadership_text" 
                        originalText="Check back later for leadership team information."
                        as="p"
                        className="text-muted-foreground"
                      />
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
                          <TranslatedText 
                            contentKey={`civic_detail.leader_${leader.id}_name`}
                            originalText={leader.name}
                            as="h3"
                            className="font-semibold text-lg"
                          />
                          <TranslatedText 
                            contentKey={`civic_detail.leader_${leader.id}_title`}
                            originalText={leader.title}
                            as="p"
                            className="text-muted-foreground mb-3"
                          />
                          
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
                    <TranslatedText contentKey="civic_detail.links_title" originalText="Important Links" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {importantLinks.length === 0 ? (
                    <div className="text-center py-8">
                      <Link className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <TranslatedText 
                        contentKey="civic_detail.no_links_title" 
                        originalText="No important links yet"
                        as="h3"
                        className="text-lg font-semibold mb-2"
                      />
                      <TranslatedText 
                        contentKey="civic_detail.no_links_text" 
                        originalText="Check back later for important links and resources."
                        as="p"
                        className="text-muted-foreground"
                      />
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
                              <TranslatedText 
                                contentKey={`civic_detail.link_${link.id}_title`}
                                originalText={link.title}
                                as="h3"
                                className="font-semibold text-lg mb-1"
                              />
                              {link.description && (
                                <TranslatedText 
                                  contentKey={`civic_detail.link_${link.id}_description`}
                                  originalText={link.description}
                                  as="p"
                                  className="text-muted-foreground text-sm mb-3"
                                />
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                trackContentClick('link', link.id, orgId);
                                window.open(link.url, '_blank');
                              }}
                              className="ml-4"
                            >
                              <TranslatedText contentKey="civic_detail.visit_link" originalText="Visit Link" />
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
                    <TranslatedText contentKey="civic_detail.gallery_title" originalText="Photo Gallery" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {galleryPhotos.length === 0 ? (
                    <div className="text-center py-8">
                      <Images className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <TranslatedText 
                        contentKey="civic_detail.no_photos_title" 
                        originalText="No photos yet"
                        as="h3"
                        className="text-lg font-semibold mb-2"
                      />
                      <TranslatedText 
                        contentKey="civic_detail.no_photos_text" 
                        originalText="Check back later for photo updates from this organization."
                        as="p"
                        className="text-muted-foreground"
                      />
                    </div>
                   ) : (
                     <>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {paginatedGallery.map((photo, index) => (
                           <div 
                             key={photo.id} 
                             className="group relative overflow-hidden rounded-lg border cursor-pointer"
                             onClick={() => {
                               trackContentClick('photo', photo.id, orgId);
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
                                      <TranslatedText 
                                        contentKey={`civic_detail.photo_${photo.id}_title`}
                                        originalText={photo.title}
                                        as="h4"
                                        className="font-semibold text-sm mb-1"
                                      />
                                    )}
                                    {photo.description && (
                                      <TranslatedText 
                                        contentKey={`civic_detail.photo_${photo.id}_description`}
                                        originalText={photo.description}
                                        as="p"
                                        className="text-xs opacity-90"
                                      />
                                    )}
                                  </div>
                                </div>
                              )}
                           </div>
                         ))}
                       </div>

                       {galleryPhotos.length > itemsPerPage && (
                         <div className="mt-6">
                           <AdminPagination
                             currentPage={galleryPage}
                             totalPages={Math.ceil(galleryPhotos.length / itemsPerPage)}
                             totalItems={galleryPhotos.length}
                             itemsPerPage={itemsPerPage}
                             onPageChange={setGalleryPage}
                           />
                         </div>
                       )}

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
                    <TranslatedText contentKey="civic_detail.events_title" originalText="Upcoming Events" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {civicEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <TranslatedText 
                        contentKey="civic_detail.no_events_title" 
                        originalText="No events scheduled"
                        as="h3"
                        className="text-lg font-semibold mb-2"
                      />
                      <TranslatedText 
                        contentKey="civic_detail.no_events_text" 
                        originalText="Check back later for event updates from this organization."
                        as="p"
                        className="text-muted-foreground"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedEvents.map((event) => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                      
                      {civicEvents.length > itemsPerPage && (
                        <div className="mt-6">
                          <AdminPagination
                            currentPage={eventsPage}
                            totalPages={Math.ceil(civicEvents.length / itemsPerPage)}
                            totalItems={civicEvents.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setEventsPage}
                          />
                        </div>
                      )}
                    </>
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