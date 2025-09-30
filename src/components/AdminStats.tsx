import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';

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
  count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const AdminStats = () => {
  const [loading, setLoading] = useState(true);
  const [totalVisits, setTotalVisits] = useState(0);
  const [totalPageViews, setTotalPageViews] = useState(0);
  const [pageStats, setPageStats] = useState<PageStats[]>([]);
  const [languageStats, setLanguageStats] = useState<LanguageStats[]>([]);
  const [tabStats, setTabStats] = useState<TabStats[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Total unique visits (count distinct by created_at date)
      const { count: totalVisitsCount } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view');

      setTotalVisits(totalVisitsCount || 0);

      // Total page views
      const { data: pageViewsData } = await supabase
        .from('analytics_events')
        .select('page_path')
        .eq('event_type', 'page_view');

      setTotalPageViews(pageViewsData?.length || 0);

      // Page visit counts
      const { data: pageData } = await supabase
        .from('analytics_events')
        .select('page_path')
        .eq('event_type', 'page_view');

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

      // Language usage stats
      const { data: languageData } = await supabase
        .from('analytics_events')
        .select('language')
        .eq('event_type', 'language_change')
        .not('language', 'is', null);

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
      }

      // Civic tab views
      const { data: tabData } = await supabase
        .from('analytics_events')
        .select('tab_name')
        .eq('event_type', 'tab_view')
        .not('tab_name', 'is', null);

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
      }

    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Site Visits</CardTitle>
            <CardDescription>All page view events</CardDescription>
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
            <CardDescription>Non-English page views</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {languageStats.reduce((sum, stat) => sum + stat.count, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Page Views Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Page Views by Path</CardTitle>
          <CardDescription>Most visited pages on the site</CardDescription>
        </CardHeader>
        <CardContent>
          {pageStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={pageStats.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="page_path" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">No page view data yet</p>
          )}
        </CardContent>
      </Card>

      {/* Language Usage Chart */}
      {languageStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Language Usage</CardTitle>
            <CardDescription>Pages viewed in different languages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={languageStats}
                  dataKey="count"
                  nameKey="language"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {languageStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Civic Tab Views */}
      {tabStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Civic Tab Views</CardTitle>
            <CardDescription>Most viewed civic organization tabs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tabStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tab_name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
