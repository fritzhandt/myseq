import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';

interface CivicStatsProps {
  orgId: string;
}

interface TabStats {
  tab_name: string;
  count: number;
}

interface ContentStats {
  content_type: string;
  count: number;
}

export const CivicStats = ({ orgId }: CivicStatsProps) => {
  const [loading, setLoading] = useState(true);
  const [pageViews, setPageViews] = useState(0);
  const [tabStats, setTabStats] = useState<TabStats[]>([]);
  const [contentClicks, setContentClicks] = useState<ContentStats[]>([]);

  useEffect(() => {
    loadStats();
  }, [orgId]);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Total page views for this civic org
      const { count: viewsCount } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view')
        .eq('civic_org_id', orgId);

      setPageViews(viewsCount || 0);

      // Tab views
      const { data: tabData } = await supabase
        .from('analytics_events')
        .select('tab_name')
        .eq('event_type', 'tab_view')
        .eq('civic_org_id', orgId)
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

      // Content clicks
      const { data: contentData } = await supabase
        .from('analytics_events')
        .select('content_type')
        .eq('event_type', 'content_click')
        .eq('civic_org_id', orgId)
        .not('content_type', 'is', null);

      if (contentData) {
        const contentCounts = contentData.reduce((acc, item) => {
          const type = item.content_type || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const sortedContent = Object.entries(contentCounts)
          .map(([content_type, count]) => ({ content_type, count }))
          .sort((a, b) => b.count - a.count);

        setContentClicks(sortedContent);
      }

    } catch (error) {
      console.error('Error loading civic stats:', error);
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
            <CardTitle>Page Views</CardTitle>
            <CardDescription>Total visits to your civic page</CardDescription>
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
              {contentClicks.reduce((sum, stat) => sum + stat.count, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Views Chart */}
      {tabStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tab Views</CardTitle>
            <CardDescription>Most viewed tabs on your page</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tabStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tab_name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Content Clicks Chart */}
      {contentClicks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Content Engagement</CardTitle>
            <CardDescription>Clicks by content type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={contentClicks}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="content_type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

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
