import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Loader2, Search, Calendar, TrendingUp, Eye, MousePointer } from 'lucide-react';
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay } from 'date-fns';

interface CivicStatsProps {
  orgId: string;
}

interface TabStats {
  tab_name: string;
  count: number;
}

interface ContentStats {
  content_type: string;
  content_id: string;
  count: number;
}

interface TrendData {
  date: string;
  count: number;
}

interface DetailedContent {
  content_id: string;
  content_type: string;
  title: string;
  clicks: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

type DateRange = 'day' | 'week' | 'month' | 'custom';

export const CivicStats = ({ orgId }: CivicStatsProps) => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [pageViews, setPageViews] = useState(0);
  const [pageViewTrend, setPageViewTrend] = useState<TrendData[]>([]);
  const [tabStats, setTabStats] = useState<TabStats[]>([]);
  const [tabTrend, setTabTrend] = useState<TrendData[]>([]);
  const [contentClicks, setContentClicks] = useState<ContentStats[]>([]);
  const [detailedContentClicks, setDetailedContentClicks] = useState<DetailedContent[]>([]);

  useEffect(() => {
    loadStats();
  }, [orgId, dateRange, customStartDate, customEndDate]);

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

      // Total page views for this civic org
      const { data: pageViewData } = await supabase
        .from('analytics_events')
        .select('created_at')
        .eq('event_type', 'page_view')
        .eq('civic_org_id', orgId)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: true });

      setPageViews(pageViewData?.length || 0);

      if (pageViewData) {
        const trendData = processTimeSeries(pageViewData, start, end);
        setPageViewTrend(trendData);
      }

      // Tab views
      const { data: tabData } = await supabase
        .from('analytics_events')
        .select('tab_name, created_at')
        .eq('event_type', 'tab_view')
        .eq('civic_org_id', orgId)
        .not('tab_name', 'is', null)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (tabData) {
        const tabCounts = tabData.reduce((acc, item) => {
          const tab = item.tab_name || 'unknown';
          acc[tab] = (acc[tab] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const sortedTabs = Object.entries(tabCounts)
          .map(([tab_name, count]) => ({ tab_name, count }))
          .sort((a, b) => b.count - a.count);

        setTabStats(sortedTabs);

        // Tab trend
        const tabTrendData = processTimeSeries(tabData, start, end);
        setTabTrend(tabTrendData);
      }

      // Content clicks with details
      const { data: contentData } = await supabase
        .from('analytics_events')
        .select('content_type, content_id')
        .eq('event_type', 'content_click')
        .eq('civic_org_id', orgId)
        .not('content_type', 'is', null)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (contentData) {
        // Aggregate by type
        const contentCounts = contentData.reduce((acc, item) => {
          const type = item.content_type || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const sortedContent = Object.entries(contentCounts)
          .map(([content_type, count]) => ({ content_type, content_id: '', count }))
          .sort((a, b) => b.count - a.count);

        setContentClicks(sortedContent);

        // Get detailed content with titles
        const detailedContent = await getDetailedContentClicks(contentData);
        setDetailedContentClicks(detailedContent);
      }

    } catch (error) {
      console.error('Error loading civic stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDetailedContentClicks = async (contentData: any[]): Promise<DetailedContent[]> => {
    const clickMap = new Map<string, { content_type: string; count: number }>();

    contentData.forEach(item => {
      if (item.content_id) {
        const key = `${item.content_type}:${item.content_id}`;
        const existing = clickMap.get(key) || { content_type: item.content_type, count: 0 };
        existing.count++;
        clickMap.set(key, existing);
      }
    });

    const detailed: DetailedContent[] = [];

    for (const [key, value] of clickMap.entries()) {
      const [content_type, content_id] = key.split(':');
      let title = 'Unknown';

      try {
        if (content_type === 'newsletter') {
          const { data } = await supabase
            .from('civic_newsletters')
            .select('title')
            .eq('id', content_id)
            .single();
          if (data) title = data.title;
        } else if (content_type === 'announcement') {
          const { data } = await supabase
            .from('civic_announcements')
            .select('title')
            .eq('id', content_id)
            .single();
          if (data) title = data.title;
        } else if (content_type === 'link') {
          const { data } = await supabase
            .from('civic_important_links')
            .select('title')
            .eq('id', content_id)
            .single();
          if (data) title = data.title;
        } else if (content_type === 'photo') {
          const { data } = await supabase
            .from('civic_gallery')
            .select('title')
            .eq('id', content_id)
            .single();
          if (data) title = data.title || 'Gallery Photo';
        }
      } catch (error) {
        console.error('Error fetching content title:', error);
      }

      detailed.push({
        content_id,
        content_type,
        title,
        clicks: value.count
      });
    }

    return detailed.sort((a, b) => b.clicks - a.clicks);
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

  const filteredTabStats = filterBySearch(tabStats, ['tab_name']);
  const filteredContentClicks = filterBySearch(detailedContentClicks, ['title', 'content_type']);

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
                  placeholder="Search content, tabs..."
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tabs" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Tabs
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <MousePointer className="h-4 w-4" />
            Content
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Page Views</CardTitle>
                <CardDescription>Total visits to your page</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pageViews.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tab Views</CardTitle>
                <CardDescription>Total tab interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {tabStats.reduce((sum, stat) => sum + stat.count, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Clicks</CardTitle>
                <CardDescription>Links, photos, announcements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {detailedContentClicks.reduce((sum, stat) => sum + stat.clicks, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Page Views Trend</CardTitle>
              <CardDescription>Daily visitor activity</CardDescription>
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
                <CardTitle>Top Tabs</CardTitle>
                <CardDescription>Most viewed tabs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tabStats.slice(0, 5).map((tab, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{tab.tab_name}</span>
                      <span className="text-sm font-bold">{tab.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Content</CardTitle>
                <CardDescription>Most clicked content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {detailedContentClicks.slice(0, 5).map((content, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex-1 truncate">
                        <span className="text-sm">{content.title}</span>
                        <span className="text-xs text-muted-foreground ml-2">({content.content_type})</span>
                      </div>
                      <span className="text-sm font-bold ml-2">{content.clicks}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tabs Tab */}
        <TabsContent value="tabs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tab Views</CardTitle>
              <CardDescription>All tabs on your page ({filteredTabStats.length} results)</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTabStats.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={filteredTabStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tab_name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-6">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-2 px-4">Tab Name</th>
                          <th className="text-right py-2 px-4">Views</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTabStats.map((tab, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-4 text-sm capitalize">{tab.tab_name}</td>
                            <td className="py-2 px-4 text-sm text-right font-medium">{tab.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-8">No tab view data</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tab Views Trend</CardTitle>
              <CardDescription>Tab interaction over time</CardDescription>
            </CardHeader>
            <CardContent>
              {tabTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={tabTrend}>
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
              <CardTitle>Content Engagement by Type</CardTitle>
              <CardDescription>Clicks by content category</CardDescription>
            </CardHeader>
            <CardContent>
              {contentClicks.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={contentClicks}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="content_type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--secondary))" />
                    </BarChart>
                  </ResponsiveContainer>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={contentClicks}
                        dataKey="count"
                        nameKey="content_type"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {contentClicks.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No content engagement data</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Content Clicks</CardTitle>
              <CardDescription>Individual content performance ({filteredContentClicks.length} results)</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredContentClicks.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-card border-b">
                      <tr>
                        <th className="text-left py-2 px-4">Title</th>
                        <th className="text-left py-2 px-4">Type</th>
                        <th className="text-right py-2 px-4">Clicks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContentClicks.map((content, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-4 text-sm">{content.title}</td>
                          <td className="py-2 px-4 text-sm">
                            <span className="capitalize text-xs bg-muted px-2 py-1 rounded">
                              {content.content_type}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-sm text-right font-medium">{content.clicks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No detailed content data</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {pageViews === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              No analytics data yet. Data will appear as users visit your page.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
