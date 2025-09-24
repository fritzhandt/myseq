import { supabase } from "@/integrations/supabase/client";

// API Gateway client for secure communication
class ApiClient {
  private readonly apiKey = "sk-proj-custom-frontend-key-2025"; // This will be set as FRONTEND_API_KEY secret
  private readonly baseUrl = "https://qdqmhgwjupsoradhktzu.supabase.co/functions/v1";

  private async makeRequest(functionName: string, data?: any, method: string = 'POST') {
    try {
      const response = await fetch(`${this.baseUrl}/api-gateway/${functionName}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
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