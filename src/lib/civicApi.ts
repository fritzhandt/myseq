import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./constants";

class CivicApiClient {
  private getSessionToken(): string | null {
    return localStorage.getItem('civic_session_token');
  }

  private async makeRequest(
    contentType: string,
    action: string,
    data?: any,
    itemId?: string
  ) {
    const sessionToken = this.getSessionToken();
    if (!sessionToken) {
      throw new Error('No session token found. Please log in.');
    }

    // Build URL with query parameters
    const baseUrl = `${SUPABASE_URL}/functions/v1/civic-content`;
    const params = new URLSearchParams({
      type: contentType,
      action: action,
    });
    if (itemId) params.set('id', itemId);

    const response = await fetch(`${baseUrl}?${params.toString()}`, {
      method: action === 'list' ? 'GET' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'x-session-token': sessionToken,
      },
      body: action !== 'list' && data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Announcements
  async listAnnouncements() {
    return this.makeRequest('announcements', 'list');
  }

  async createAnnouncement(data: { title: string; content: string; photos?: string[] }) {
    return this.makeRequest('announcements', 'create', data);
  }

  async updateAnnouncement(id: string, data: { title: string; content: string; photos?: string[] }) {
    return this.makeRequest('announcements', 'update', data, id);
  }

  async deleteAnnouncement(id: string) {
    return this.makeRequest('announcements', 'delete', undefined, id);
  }

  // Newsletters
  async listNewsletters() {
    return this.makeRequest('newsletters', 'list');
  }

  async createNewsletter(data: { title: string; file_path: string }) {
    return this.makeRequest('newsletters', 'create', data);
  }

  async deleteNewsletter(id: string) {
    return this.makeRequest('newsletters', 'delete', undefined, id);
  }

  // Leadership
  async listLeadership() {
    return this.makeRequest('leadership', 'list');
  }

  async createLeadership(data: {
    name: string;
    title: string;
    photo_url?: string;
    contact_info?: Record<string, any>;
    order_index?: number;
  }) {
    return this.makeRequest('leadership', 'create', data);
  }

  async updateLeadership(id: string, data: {
    name: string;
    title: string;
    photo_url?: string;
    contact_info?: Record<string, any>;
    order_index?: number;
  }) {
    return this.makeRequest('leadership', 'update', data, id);
  }

  async deleteLeadership(id: string) {
    return this.makeRequest('leadership', 'delete', undefined, id);
  }

  // Important Links
  async listLinks() {
    return this.makeRequest('links', 'list');
  }

  async createLink(data: {
    title: string;
    url: string;
    description?: string;
    is_active?: boolean;
    order_index?: number;
  }) {
    return this.makeRequest('links', 'create', data);
  }

  async updateLink(id: string, data: {
    title: string;
    url: string;
    description?: string;
    is_active?: boolean;
    order_index?: number;
  }) {
    return this.makeRequest('links', 'update', data, id);
  }

  async deleteLink(id: string) {
    return this.makeRequest('links', 'delete', undefined, id);
  }

  // Gallery
  async listGallery() {
    return this.makeRequest('gallery', 'list');
  }

  async createGalleryItem(data: {
    photo_url: string;
    title?: string;
    description?: string;
    order_index?: number;
  }) {
    return this.makeRequest('gallery', 'create', data);
  }

  async updateGalleryItem(id: string, data: {
    photo_url: string;
    title?: string;
    description?: string;
    order_index?: number;
  }) {
    return this.makeRequest('gallery', 'update', data, id);
  }

  async deleteGalleryItem(id: string) {
    return this.makeRequest('gallery', 'delete', undefined, id);
  }

  // General Settings
  async updateGeneralSettings(data: {
    name: string;
    description: string;
    coverage_area: string;
    organization_type: string;
    meeting_info?: string;
    meeting_address?: string;
    contact_info?: Record<string, any>;
  }) {
    return this.makeRequest('general', 'update', data);
  }
}

export const civicApi = new CivicApiClient();
