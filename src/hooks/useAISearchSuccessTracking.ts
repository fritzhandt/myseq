import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from './useAnalytics';

interface AISearchState {
  type: 'redirect' | 'general_answer';
  timestamp: number;
  sourcePath: string;
}

const STORAGE_KEY = 'ai_search_state';
const SUCCESS_THRESHOLD_MS = 3000;

export const useAISearchSuccessTracking = () => {
  const location = useLocation();
  const { trackAISearchSuccess, trackAISearchUnsuccessful } = useAnalytics();

  // Initialize AI search tracking
  const initializeTracking = useCallback((type: 'redirect' | 'general_answer') => {
    const state: AISearchState = {
      type,
      timestamp: Date.now(),
      sourcePath: location.pathname,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [location.pathname]);

  // Mark as content link click (called from content link wrappers)
  const markContentLinkClick = useCallback(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      // Content link clicked = success
      trackAISearchSuccess();
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [trackAISearchSuccess]);

  // Check and resolve tracking on mount and route changes
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const state: AISearchState = JSON.parse(stored);
      const elapsed = Date.now() - state.timestamp;

      // If we navigated to a different page
      if (location.pathname !== state.sourcePath) {
        // If less than 3 seconds and no content link was clicked
        if (elapsed < SUCCESS_THRESHOLD_MS) {
          trackAISearchUnsuccessful();
          sessionStorage.removeItem(STORAGE_KEY);
        }
        // If more than 3 seconds, it was already marked as success by the timer
        return;
      }

      // Still on the same page - set up success timer if not already elapsed
      if (elapsed < SUCCESS_THRESHOLD_MS) {
        const remainingTime = SUCCESS_THRESHOLD_MS - elapsed;
        const timer = setTimeout(() => {
          // Check if still on same page and state still exists
          const currentStored = sessionStorage.getItem(STORAGE_KEY);
          if (currentStored) {
            const currentState: AISearchState = JSON.parse(currentStored);
            if (window.location.pathname === currentState.sourcePath) {
              trackAISearchSuccess();
              sessionStorage.removeItem(STORAGE_KEY);
            }
          }
        }, remainingTime);

        return () => clearTimeout(timer);
      } else {
        // Already past threshold, mark as success
        trackAISearchSuccess();
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error processing AI search tracking:', e);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [location.pathname, trackAISearchSuccess, trackAISearchUnsuccessful]);

  return {
    initializeTracking,
    markContentLinkClick,
  };
};
