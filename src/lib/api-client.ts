import { supabase } from "@/integrations/supabase/client";

// API Gateway client for secure communication using Supabase authentication
class ApiClient {
  private readonly baseUrl = "https://qdqmhgwjupsoradhktzu.supabase.co/functions/v1";

  private async makeRequest(functionName: string, data?: any, method: string = 'POST') {
    try {
      // Get Supabase session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcW1oZ3dqdXBzb3JhZGhrdHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzODY5NzQsImV4cCI6MjA3Mzk2Mjk3NH0.90wVzi9LjnGUlBtCEBw6XHKJkf2DY1e_nVq7sP0L_8o',
      };

      // Add authorization header if user is authenticated
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`${this.baseUrl}/api-gateway/${functionName}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Client Error (${functionName}):`, error);
      throw error;
    }
  }

  // Search agencies through the secure gateway
  async searchAgencies(query: string, preferredLevel?: string) {
    return this.makeRequest('search-agencies', { query, preferredLevel });
  }

  // Process agency PDF through the secure gateway
  async processAgencyPdf(data: any) {
    return this.makeRequest('process-agency-pdf', data);
  }

  // Add more function wrappers as needed
}

// Export singleton instance
export const apiClient = new ApiClient();

// Fallback to direct Supabase calls for development/debugging
export const directSupabaseCall = {
  searchAgencies: async (query: string, preferredLevel?: string) => {
    console.warn('Using direct Supabase call - should use API Gateway in production');
    return supabase.functions.invoke('search-agencies', {
      body: { query, preferredLevel }
    });
  },
  
  processAgencyPdf: async (data: any) => {
    console.warn('Using direct Supabase call - should use API Gateway in production');
    return supabase.functions.invoke('process-agency-pdf', {
      body: data
    });
  }
};