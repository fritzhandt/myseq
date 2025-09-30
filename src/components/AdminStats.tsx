import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Loader2, Search, Calendar, TrendingUp, Globe, FileText, Users } from 'lucide-react';
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay } from 'date-fns';

interface PageStats {
  page_path: string;
  count: number;
}

interface LanguageStats {
  language: string;
  count: number;
}

interface TabStats {
  tab_name: string;
  civic_org_id: string;
  count: number;
}

interface CivicOrgStats {
  civic_org_name: string;
  civic_org_id: string;
  page_views: number;
  tab_views: number;
  content_clicks: number;
}

interface ContentStats {
  content_type: string;
  count: number;
}

interface TrendData {
  date: string;
  count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B9D', '#C89EFC'];

type DateRange = 'day' | 'week' | 'month' | 'custom';

export const AdminStats = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Overview stats
  const [totalVisits, setTotalVisits] = useState(0);
  const [totalPageViews, setTotalPageViews] = useState(0);
  const [pageViewTrend, setPageViewTrend] = useState<TrendData[]>([]);
  
  // Page stats
  const [pageStats, setPageStats] = useState<PageStats[]>([]);
  
  // Civic stats
  const [civicStats, setCivicStats] = useState<CivicOrgStats[]>([]);
  const [tabStats, setTabStats] = useState<TabStats[]>([]);
  
  // Language stats
  const [languageStats, setLanguageStats] = useState<LanguageStats[]>([]);
  const [languageTrend, setLanguageTrend] = useState<TrendData[]>([]);
  
  // Content stats
  const [contentStats, setContentStats] = useState<ContentStats[]>([]);

  useEffect(() => {
    loadStats();
  }, [dateRange, customStartDate, customEndDate]);

  const getDateFilter = () => {
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case 'day':
        startDate = subDays(now, 1);
        break;
      case 'week':
        startDate = subWeeks(now, 1);
        break;
      case 'month':
        startDate = subMonths(now, 1);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          return {
            start: startOfDay(new Date(customStartDate)),
            end: endOfDay(new Date(customEndDate))
          };
        }
        startDate = subWeeks(now, 1);
        break;
      default:
        startDate = subWeeks(now, 1);
    }

    return { start: startDate, end: now };
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const { start, end } = getDateFilter();

      // Build base query with date filter
      const baseQuery = supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      // Total page views
      const { count: totalPageViewsCount } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      setTotalPageViews(totalPageViewsCount || 0);

      // Get all page view events for trend
      const { data: allPageViews } = await supabase
        .from('analytics_events')
        .select('created_at')
        .eq('event_type', 'page_view')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: true });

      if (allPageViews) {
        const trendData = processTimeSeries(allPageViews, start, end);
        setPageViewTrend(trendData);
        setTotalVisits(allPageViews.length);
      }

      // Page visit counts
      const { data: pageData } = await supabase
        .from('analytics_events')
        .select('page_path')
        .eq('event_type', 'page_view')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (pageData) {
        const pageCounts = pageData.reduce((acc, item) => {
          const path = item.page_path || 'unknown';
          acc[path] = (acc[path] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const sortedPages = Object.entries(pageCounts)
          .map(([page_path, count]) => ({ page_path, count }))
          .sort((a, b) => b.count - a.count);

        setPageStats(sortedPages);
      }

      // Civic organization stats
      const { data: civicPageViews } = await supabase
        .from('analytics_events')
        .select('civic_org_id, page_path')
        .eq('event_type', 'page_view')
        .not('civic_org_id', 'is', null)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      const { data: civicTabViews } = await supabase
        .from('analytics_events')
        .select('civic_org_id, tab_name')
        .eq('event_type', 'tab_view')
        .not('civic_org_id', 'is', null)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      const { data: civicContentClicks } = await supabase
        .from('analytics_events')
        .select('civic_org_id, content_type')
        .eq('event_type', 'content_click')
        .not('civic_org_id', 'is', null)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      // Get civic org names
      const { data: civicOrgs } = await supabase
        .from('civic_organizations')
        .select('id, name');

      const orgMap = new Map(civicOrgs?.map(org => [org.id, org.name]) || []);

      // Combine civic stats
      const civicStatsMap = new Map<string, CivicOrgStats>();

      civicPageViews?.forEach(item => {
        if (!item.civic_org_id) return;
        const existing = civicStatsMap.get(item.civic_org_id) || {
          civic_org_id: item.civic_org_id,
          civic_org_name: orgMap.get(item.civic_org_id) || 'Unknown',
          page_views: 0,
          tab_views: 0,
          content_clicks: 0
        };
        existing.page_views++;
        civicStatsMap.set(item.civic_org_id, existing);
      });

      civicTabViews?.forEach(item => {
        if (!item.civic_org_id) return;
        const existing = civicStatsMap.get(item.civic_org_id) || {
          civic_org_id: item.civic_org_id,
          civic_org_name: orgMap.get(item.civic_org_id) || 'Unknown',
          page_views: 0,
          tab_views: 0,
          content_clicks: 0
        };
        existing.tab_views++;
        civicStatsMap.set(item.civic_org_id, existing);
      });

      civicContentClicks?.forEach(item => {
        if (!item.civic_org_id) return;
        const existing = civicStatsMap.get(item.civic_org_id) || {
          civic_org_id: item.civic_org_id,
          civic_org_name: orgMap.get(item.civic_org_id) || 'Unknown',
          page_views: 0,
          tab_views: 0,
          content_clicks: 0
        };
        existing.content_clicks++;
        civicStatsMap.set(item.civic_org_id, existing);
      });

      const sortedCivicStats = Array.from(civicStatsMap.values())
        .sort((a, b) => b.page_views - a.page_views);

      setCivicStats(sortedCivicStats);

      // Tab stats with civic org info
      if (civicTabViews) {
        const tabCounts = civicTabViews.reduce((acc, item) => {
          const key = `${item.civic_org_id}:${item.tab_name}`;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const sortedTabs = Object.entries(tabCounts)
          .map(([key, count]) => {
            const [civic_org_id, tab_name] = key.split(':');
            return { civic_org_id, tab_name, count };
          })
          .sort((a, b) => b.count - a.count);

        setTabStats(sortedTabs);
      }

      // Language usage stats
      const { data: languageData } = await supabase
        .from('analytics_events')
        .select('language, created_at')
        .eq('event_type', 'language_change')
        .not('language', 'is', null)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (languageData) {
        const langCounts = languageData.reduce((acc, item) => {
          const lang = item.language || 'unknown';
          acc[lang] = (acc[lang] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const sortedLangs = Object.entries(langCounts)
          .map(([language, count]) => ({ language, count }))
          .sort((a, b) => b.count - a.count);

        setLanguageStats(sortedLangs);

        // Language trend
        const langTrendData = processTimeSeries(languageData, start, end);
        setLanguageTrend(langTrendData);
      }

      // Content click stats
      const { data: contentData } = await supabase
        .from('analytics_events')
        .select('content_type')
        .eq('event_type', 'content_click')
        .not('content_type', 'is', null)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (contentData) {
        const contentCounts = contentData.reduce((acc, item) => {
          const type = item.content_type || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const sortedContent = Object.entries(contentCounts)
          .map(([content_type, count]) => ({ content_type, count }))
          .sort((a, b) => b.count - a.count);

        setContentStats(sortedContent);
      }

    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const processTimeSeries = (data: any[], startDate: Date, endDate: Date): TrendData[] => {
    const dayMap = new Map<string, number>();
    
    data.forEach(item => {
      const date = format(new Date(item.created_at), 'MMM dd');
      dayMap.set(date, (dayMap.get(date) || 0) + 1);
    });

    return Array.from(dayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const filterBySearch = <T extends Record<string, any>>(data: T[], keys: (keyof T)[]): T[] => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(item =>
      keys.some(key => String(item[key]).toLowerCase().includes(query))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const filteredPageStats = filterBySearch(pageStats, ['page_path']);
  const filteredCivicStats = filterBySearch(civicStats, ['civic_org_name']);
  const filteredLanguageStats = filterBySearch(languageStats, ['language']);
  const filteredContentStats = filterBySearch(contentStats, ['content_type']);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filters & Date Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages, civics, languages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Last 24 Hours</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {dateRange === 'custom' && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Date</label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">End Date</label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={loadStats}>Apply</Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="civics" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Civics
          </TabsTrigger>
          <TabsTrigger value="languages" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Languages
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Site Visits</CardTitle>
                <CardDescription>Page view events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalVisits.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Page Views</CardTitle>
                <CardDescription>Individual page loads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalPageViews.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Language Switches</CardTitle>
                <CardDescription>Non-English views</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {languageStats.reduce((sum, stat) => sum + stat.count, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Page Views Trend</CardTitle>
              <CardDescription>Daily page view activity</CardDescription>
            </CardHeader>
            <CardContent>
              {pageViewTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={pageViewTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No trend data yet</p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most visited pages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pageStats.slice(0, 5).map((page, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm truncate flex-1">{page.page_path}</span>
                      <span className="text-sm font-bold ml-2">{page.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Civic Orgs</CardTitle>
                <CardDescription>Most active organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {civicStats.slice(0, 5).map((civic, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm truncate flex-1">{civic.civic_org_name}</span>
                      <span className="text-sm font-bold ml-2">{civic.page_views}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Performance</CardTitle>
              <CardDescription>View counts for all pages ({filteredPageStats.length} pages)</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPageStats.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {filteredPageStats.map((page, index) => (
                    <Card key={index} className="bg-muted/50">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate mb-1">{page.page_path}</p>
                            <p className="text-xs text-muted-foreground">Page Views</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{page.count}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No page view data</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Civics Tab */}
        <TabsContent value="civics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Civic Organizations Performance</CardTitle>
              <CardDescription>Engagement metrics for each organization ({filteredCivicStats.length} organizations)</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredCivicStats.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCivicStats.map((civic, index) => (
                    <Card key={index} className="bg-gradient-to-br from-primary/5 to-accent/5">
                      <CardHeader>
                        <CardTitle className="text-lg">{civic.civic_org_name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Page Views</span>
                            <span className="text-xl font-bold">{civic.page_views}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Tab Views</span>
                            <span className="text-xl font-bold">{civic.tab_views}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Content Clicks</span>
                            <span className="text-xl font-bold">{civic.content_clicks}</span>
                          </div>
                          <div className="pt-3 border-t">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Total Engagement</span>
                              <span className="text-2xl font-bold text-primary">
                                {civic.page_views + civic.tab_views + civic.content_clicks}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No civic organization data</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Languages Tab */}
        <TabsContent value="languages" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Language Distribution</CardTitle>
                <CardDescription>Pages viewed in different languages</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredLanguageStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={filteredLanguageStats}
                        dataKey="count"
                        nameKey="language"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {filteredLanguageStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No language data</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Language Usage Details</CardTitle>
                <CardDescription>Breakdown by language ({filteredLanguageStats.length} results)</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredLanguageStats.length > 0 ? (
                  <div className="space-y-3">
                    {filteredLanguageStats.map((lang, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm font-medium">{lang.language.toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-bold">{lang.count} views</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No language data</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Language Switch Trend</CardTitle>
              <CardDescription>Language changes over time</CardDescription>
            </CardHeader>
            <CardContent>
              {languageTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={languageTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--accent))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No trend data yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Engagement</CardTitle>
              <CardDescription>Clicks by content type ({filteredContentStats.length} results)</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredContentStats.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={filteredContentStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="content_type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--secondary))" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-6">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-2 px-4">Content Type</th>
                          <th className="text-right py-2 px-4">Clicks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredContentStats.map((content, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-4 text-sm capitalize">{content.content_type}</td>
                            <td className="py-2 px-4 text-sm text-right font-medium">{content.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-8">No content engagement data</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
