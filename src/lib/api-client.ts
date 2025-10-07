import { supabase } from '@/integrations/supabase/client';

class ApiClient {
  private async makeRequest(functionName: string, data: any) {
    const { data: result, error } = await supabase.functions.invoke(functionName, {
      body: data,
    });

    if (error) throw error;
    return result;
  }

  async searchAgencies(query: string, preferredLevel?: string) {
    return this.makeRequest('search-agencies', { 
      query,
      preferred_level: preferredLevel 
    });
  }

  async processAgencyPdf(data: any) {
    return this.makeRequest('process-agency-pdf', data);
  }
}

export const apiClient = new ApiClient();