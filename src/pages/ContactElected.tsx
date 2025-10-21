import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Phone, Mail, MapPin, User, ChevronDown, ChevronUp, ExternalLink, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SkipLinks from '@/components/SkipLinks';
import { cn } from '@/lib/utils';

interface ElectedOfficial {
  id: string;
  name: string;
  title: string;
  office: string;
  level: string;
  category: string;
  district?: string;
  party?: string;
  phone?: string;
  email?: string;
  office_address?: string;
  website?: string;
  photo_url?: string;
  bio?: string;
}

const ContactElected = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [expandedOfficials, setExpandedOfficials] = useState<{ [key: string]: boolean }>({});
  const [officials, setOfficials] = useState<ElectedOfficial[]>([]);
  const [loading, setLoading] = useState(true);
  const [guidanceOpen, setGuidanceOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleOfficial = (id: string) => {
    setExpandedOfficials(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleFilterChange = (filter: string | null) => {
    setActiveFilter(filter);
    setGuidanceOpen(false); // Close guidance when a filter is selected
  };

  const fetchOfficials = async () => {
    try {
      const { data, error } = await supabase
        .from('elected_officials')
        .select('*')
        .order('level', { ascending: true })
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setOfficials(data || []);
    } catch (error) {
      console.error('Error fetching elected officials:', error);
      toast({
        title: "Error",
        description: "Failed to load elected officials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Contact Elected Officials - My SEQ";
    fetchOfficials();
  }, []);

  // Custom ordering for specific officials
  const getCustomOrder = (official: ElectedOfficial, level: string, category: string) => {
    // City executives: Eric Adams, Jumaane Williams, Brad Lander, Donovan Richards, Melinda Katz
    if (level === 'city' && category === 'executive') {
      if (official.name === 'Eric Adams') return 0;
      if (official.name === 'Jumaane Williams') return 1;
      if (official.name === 'Brad Lander') return 2;
      if (official.name === 'Donovan Richards') return 3;
      if (official.name === 'Melinda Katz') return 4;
      return 5;
    }
    
    // Federal legislative: Chuck Schumer, Kirsten Gillibrand, Gregory Meeks, Grace Meng
    if (level === 'federal' && category === 'legislative') {
      if (official.name === 'Chuck Schumer') return 0;
      if (official.name === 'Kirsten Gillibrand') return 1;
      if (official.name === 'Gregory Meeks') return 2;
      if (official.name === 'Grace Meng') return 3;
      return 4;
    }
    
    // State legislative: Comrie, Sanders, Liu, Stavisky, Vanel, Hyndman, Anderson, Cook
    if (level === 'state' && category === 'legislative') {
      if (official.name === 'Leroy Comrie') return 0;
      if (official.name === 'James Sanders Jr.') return 1;
      if (official.name === 'John Liu') return 2;
      if (official.name === 'Toby Ann Stavisky') return 3;
      if (official.name === 'Clyde Vanel') return 4;
      if (official.name === 'Alicia Hyndman') return 5;
      if (official.name === 'Khaleel Anderson') return 6;
      if (official.name === 'Vivian Cook') return 7;
      return 8;
    }
    
    return 0;
  };

  // Filter officials by search term
  const filteredOfficials = useMemo(() => {
    if (!searchTerm.trim()) return officials;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return officials.filter(official => 
      official.name.toLowerCase().includes(lowerSearchTerm) ||
      official.title.toLowerCase().includes(lowerSearchTerm) ||
      official.office.toLowerCase().includes(lowerSearchTerm) ||
      (official.district && official.district.toLowerCase().includes(lowerSearchTerm))
    );
  }, [officials, searchTerm]);

  const groupedOfficials = useMemo(() => {
    const grouped = filteredOfficials.reduce((acc, official) => {
      const key = official.level;
      if (!acc[key]) {
        acc[key] = {};
      }
      if (!acc[key][official.category]) {
        acc[key][official.category] = [];
      }
      acc[key][official.category].push(official);
      return acc;
    }, {} as Record<string, Record<string, ElectedOfficial[]>>);

    // Sort officials within each category with custom ordering
    Object.entries(grouped).forEach(([level, categories]) => {
      Object.entries(categories).forEach(([category, officials]) => {
        officials.sort((a, b) => {
          const orderA = getCustomOrder(a, level, category);
          const orderB = getCustomOrder(b, level, category);
          
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          
          // Default alphabetical sorting
          return a.name.localeCompare(b.name);
        });
      });
    });

    return grouped;
  }, [filteredOfficials]);

  const levelOrder = ['federal', 'state', 'city'];
  const levelTitles = {
    federal: 'Federal Representatives',
    state: 'New York State Representatives', 
    city: 'New York City Representatives'
  };

  const categoryTitles = {
    legislative: 'Legislative',
    executive: 'Executive'
  };

  // Custom category title for city legislative
  const getCategoryTitle = (category: string, level: string) => {
    if (level === 'city' && category === 'legislative') {
      return 'City Council';
    }
    return categoryTitles[category as keyof typeof categoryTitles] || category;
  };

  // Check if a section should be displayed based on active filter
  const shouldDisplaySection = (level: string, category: string) => {
    if (!activeFilter) return true;
    
    if (activeFilter === 'federal') return level === 'federal';
    if (activeFilter === 'state-executive') return level === 'state' && category === 'executive';
    if (activeFilter === 'state-legislative') return level === 'state' && category === 'legislative';
    if (activeFilter === 'city-executive') return level === 'city' && category === 'executive';
    if (activeFilter === 'city-council') return level === 'city' && category === 'legislative';
    
    return true;
  };

  if (loading) {
    return (
      <>
        <SkipLinks />
        <div className="min-h-screen flex flex-col">
          <header id="primary-navigation">
            <Navbar />
          </header>
          <main id="main-content" className="flex-1">
        <Navbar />
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">
                  Loading elected officials...
                </div>
              </div>
            </div>
          </div>
        </div>
        </main>
        <Footer />
      </div>
      </>
    );
  }

  return (
    <>
      <SkipLinks />
      <div className="min-h-screen flex flex-col">
        <header id="primary-navigation">
          <Navbar />
        </header>
        <main id="main-content" className="py-16 flex-1">
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
            
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-6">
                Contact Your Elected Officials
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
                Facing a federal, state, or city issue? Want to voice your concerns? Contact your elected representative and get help immediately.
              </p>
              <Button
                onClick={() => navigate('/my-elected-lookup')}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3"
              >
                <User className="mr-2 h-4 w-4" />
                Find My Specific Representatives
              </Button>
            </div>

            {/* Search Bar */}
            <div className="mb-8 max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by name, title, office, or district..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mb-12">
              <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
                <Button
                  variant={activeFilter === null ? "default" : "outline"}
                  onClick={() => handleFilterChange(null)}
                  className={cn(
                    "transition-all",
                    activeFilter === null && "bg-primary text-white"
                  )}
                >
                  All Representatives
                </Button>
                <Button
                  variant={activeFilter === 'federal' ? "default" : "outline"}
                  onClick={() => handleFilterChange('federal')}
                  className={cn(
                    "transition-all",
                    activeFilter === 'federal' && "bg-primary text-white"
                  )}
                >
                  Federal
                </Button>
                <Button
                  variant={activeFilter === 'state-executive' ? "default" : "outline"}
                  onClick={() => handleFilterChange('state-executive')}
                  className={cn(
                    "transition-all",
                    activeFilter === 'state-executive' && "bg-primary text-white"
                  )}
                >
                  State Executive
                </Button>
                <Button
                  variant={activeFilter === 'state-legislative' ? "default" : "outline"}
                  onClick={() => handleFilterChange('state-legislative')}
                  className={cn(
                    "transition-all",
                    activeFilter === 'state-legislative' && "bg-primary text-white"
                  )}
                >
                  State Legislative
                </Button>
                <Button
                  variant={activeFilter === 'city-executive' ? "default" : "outline"}
                  onClick={() => handleFilterChange('city-executive')}
                  className={cn(
                    "transition-all",
                    activeFilter === 'city-executive' && "bg-primary text-white"
                  )}
                >
                  City Executive
                </Button>
                <Button
                  variant={activeFilter === 'city-council' ? "default" : "outline"}
                  onClick={() => handleFilterChange('city-council')}
                  className={cn(
                    "transition-all",
                    activeFilter === 'city-council' && "bg-primary text-white"
                  )}
                >
                  City Council
                </Button>
              </div>
            </div>

            {/* Who Should I Contact Guidance */}
            <div className="max-w-3xl mx-auto mb-12">
              <Collapsible open={guidanceOpen} onOpenChange={setGuidanceOpen}>
                <Card className="border-primary/20 shadow-lg animate-fade-in" style={{ boxShadow: '0 0 20px rgba(var(--primary), 0.2)' }}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">
                          Who should I contact?
                        </CardTitle>
                        {guidanceOpen ? (
                          <ChevronUp className="w-5 h-5 text-primary" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">
                        Most day-to-day problems are handled locally, so we recommend reaching out to your local elected officials first. If it turns out you need federal help, your local offices will point you in the right direction.
                      </p>
                      <p className="text-muted-foreground">
                        For emergencies, dial 911. For non-emergency and other police related matters, please use the{' '}
                        <Link to="/police-precincts" className="text-primary hover:underline font-medium">
                          Police Precincts
                        </Link>{' '}
                        page for more information.
                      </p>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>

            {levelOrder.map((level) => {
              const levelData = groupedOfficials[level];
              if (!levelData) return null;

              // Check if any category in this level should be displayed
              const hasVisibleCategories = Object.entries(levelData).some(([category]) => 
                shouldDisplaySection(level, category)
              );

              if (!hasVisibleCategories) return null;

              return (
                <div key={level} className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 text-center">
                    {levelTitles[level as keyof typeof levelTitles]}
                  </h2>
                  
                  {Object.entries(levelData).map(([category, categoryOfficials]) => {
                    // Skip this category if it doesn't match the filter
                    if (!shouldDisplaySection(level, category)) return null;

                    return (
                      <div key={category} className="mb-8">
                        <h3 className="text-xl font-semibold mb-4 text-primary">
                          {getCategoryTitle(category, level)}
                        </h3>

                      {/* Mobile Layout - Collapsible Cards */}
                      <div className="md:hidden">
                        <p className="text-sm text-muted-foreground text-center mb-4">
                          Click a name to view their contact information
                        </p>
                        <div className="space-y-4">
                          {categoryOfficials.map((official) => (
                            <Collapsible
                              key={official.id}
                              open={expandedOfficials[official.id]}
                              onOpenChange={() => toggleOfficial(official.id)}
                            >
                              <Card>
                                <CollapsibleTrigger asChild>
                                  <CardHeader className="pb-4 cursor-pointer hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        {official.photo_url ? (
                                          <img 
                                            src={official.photo_url} 
                                            alt={official.name}
                                            className="w-12 h-12 rounded-full object-cover mr-3"
                                          />
                                        ) : (
                                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                                            <User className="w-6 h-6 text-primary" />
                                          </div>
                                        )}
                                        <div className="text-left">
                                          <CardTitle className="text-lg">{official.name}</CardTitle>
                                          <p className="text-sm text-muted-foreground">{official.office}</p>
                                          <div className="mt-1">
                                            <p className="text-sm font-medium">{official.title}</p>
                                            {official.district && (
                                              <p className="text-xs text-muted-foreground">{official.district}</p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      {expandedOfficials[official.id] ? (
                                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                      ) : (
                                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                      )}
                                    </div>
                                  </CardHeader>
                                </CollapsibleTrigger>
                                
                                <CollapsibleContent>
                                  <CardContent className="space-y-4 pt-0">
                                     {official.phone && (
                                       <div className="flex items-start space-x-3">
                                         <Phone className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                         <div>
                                           <p className="text-sm font-medium">
                                             Phone
                                           </p>
                                           <a 
                                             href={`tel:${official.phone}`}
                                             className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                           >
                                             {official.phone}
                                           </a>
                                         </div>
                                       </div>
                                     )}
                                     
                                     {official.email && (
                                       <div className="flex items-start space-x-3">
                                         <Mail className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                         <div>
                                           <p className="text-sm font-medium">
                                             Email
                                           </p>
                                           <a 
                                             href={`mailto:${official.email}`}
                                             className="text-sm text-muted-foreground hover:text-primary transition-colors break-all"
                                           >
                                             {official.email}
                                           </a>
                                         </div>
                                       </div>
                                     )}
                                     
                                     {official.office_address && (
                                       <div className="flex items-start space-x-3">
                                         <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                         <div>
                                           <p className="text-sm font-medium">
                                             Office Address
                                           </p>
                                           <p className="text-sm text-muted-foreground">
                                             {official.office_address}
                                           </p>
                                         </div>
                                       </div>
                                     )}

                                      {official.website && (
                                        <div className="flex items-start space-x-3">
                                          <ExternalLink className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                          <div>
                                            <p className="text-sm font-medium">
                                              Website
                                            </p>
                                            <a 
                                              href={`https://${official.website}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                            >
                                              {official.website}
                                            </a>
                                          </div>
                                        </div>
                                      )}
                                  </CardContent>
                                </CollapsibleContent>
                              </Card>
                            </Collapsible>
                          ))}
                        </div>
                      </div>

                      {/* Desktop/Tablet Layout - Grid Cards */}
                      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryOfficials.map((official) => (
                          <Card key={official.id} className="h-full">
                            <CardHeader className="pb-4">
                              <div className="flex items-center mb-2">
                                {official.photo_url ? (
                                  <img 
                                    src={official.photo_url} 
                                    alt={official.name}
                                    className="w-12 h-12 rounded-full object-cover mr-3"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                                    <User className="w-6 h-6 text-primary" />
                                  </div>
                                )}
                                <div>
                                  <CardTitle className="text-lg">{official.name}</CardTitle>
                                  <p className="text-sm text-muted-foreground">{official.office}</p>
                                </div>
                              </div>
                              <div className="bg-muted/50 px-3 py-2 rounded-md">
                                <p className="text-sm font-medium">{official.title}</p>
                                {official.district && (
                                  <p className="text-xs text-muted-foreground">{official.district}</p>
                                )}
                              </div>
                            </CardHeader>
                            
                            <CardContent className="space-y-4">
                               {official.phone && (
                                 <div className="flex items-start space-x-3">
                                   <Phone className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                   <div>
                                     <p className="text-sm font-medium">
                                       Phone
                                     </p>
                                     <a 
                                       href={`tel:${official.phone}`}
                                       className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                     >
                                       {official.phone}
                                     </a>
                                   </div>
                                 </div>
                               )}
                               
                               {official.email && (
                                 <div className="flex items-start space-x-3">
                                   <Mail className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                   <div>
                                     <p className="text-sm font-medium">
                                       Email
                                     </p>
                                     <a 
                                       href={`mailto:${official.email}`}
                                       className="text-sm text-muted-foreground hover:text-primary transition-colors break-all"
                                     >
                                       {official.email}
                                     </a>
                                   </div>
                                 </div>
                               )}
                               
                               {official.office_address && (
                                 <div className="flex items-start space-x-3">
                                   <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                   <div>
                                     <p className="text-sm font-medium">
                                       Office Address
                                     </p>
                                     <p className="text-sm text-muted-foreground">
                                       {official.office_address}
                                     </p>
                                   </div>
                                 </div>
                               )}

                               {official.website && (
                                 <div className="flex items-start space-x-3">
                                   <ExternalLink className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                   <div>
                                     <p className="text-sm font-medium">
                                       Website
                                     </p>
                                    <a 
                                      href={`https://${official.website}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                      {official.website}
                                    </a>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
                </div>
              );
            })}

            <div className="mt-12 bg-muted p-8 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">
                Tips for Contacting Your Representatives
              </h2>
              <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                <div>
                  <h3 className="font-medium text-foreground mb-2">
                    Be Clear and Concise
                  </h3>
                  <p>
                    State your position clearly and include specific details about how the issue affects you and your community.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">
                    Include Your Address
                  </h3>
                  <p>
                    Always include your full address to verify you're a constituent in their district.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">
                    Follow Up
                  </h3>
                  <p>
                    If you don't receive a response within 2-3 weeks, it's appropriate to follow up politely.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">
                    Be Respectful
                  </h3>
                  <p>
                    Maintain a professional and respectful tone, even when discussing contentious issues.
                  </p>
                </div>
              </div>
            </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
      </>
    );
};

export default ContactElected;