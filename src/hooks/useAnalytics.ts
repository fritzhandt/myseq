import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_type: 'page_view' | 'tab_view' | 'content_click' | 'language_change';
  page_path?: string;
  civic_org_id?: string;
  tab_name?: string;
  content_type?: 'link' | 'photo' | 'announcement' | 'newsletter';
  content_id?: string;
  language?: string;
}

export const useAnalytics = () => {
  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      await supabase.from('analytics_events').insert([event]);
    } catch (error) {
      // Silent fail - don't disrupt user experience
      console.error('Analytics tracking error:', error);
    }
  }, []);

  const trackPageView = useCallback((pagePath: string, civicOrgId?: string, language?: string) => {
    trackEvent({
      event_type: 'page_view',
      page_path: pagePath,
      civic_org_id: civicOrgId,
      language: language !== 'en' ? language : undefined,
    });
  }, [trackEvent]);

  const trackTabView = useCallback((tabName: string, civicOrgId?: string) => {
    trackEvent({
      event_type: 'tab_view',
      tab_name: tabName,
      civic_org_id: civicOrgId,
    });
  }, [trackEvent]);

  const trackContentClick = useCallback((
    contentType: 'link' | 'photo' | 'announcement' | 'newsletter',
    contentId: string,
    civicOrgId?: string
  ) => {
    trackEvent({
      event_type: 'content_click',
      content_type: contentType,
      content_id: contentId,
      civic_org_id: civicOrgId,
    });
  }, [trackEvent]);

  const trackLanguageChange = useCallback((language: string, pagePath: string) => {
    trackEvent({
      event_type: 'language_change',
      language,
      page_path: pagePath,
    });
  }, [trackEvent]);

  return {
    trackPageView,
    trackTabView,
    trackContentClick,
    trackLanguageChange,
  };
};
