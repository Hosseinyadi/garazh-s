// Bil Flow API Service
// Replaces Supabase with custom API calls

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  // Set authentication token
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Get headers for API requests
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'خطا در درخواست');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Authentication methods
  async sendOTP(phone: string): Promise<ApiResponse> {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async verifyOTP(phone: string, otp: string, name?: string): Promise<ApiResponse<{
    user: any;
    token: string;
  }>> {
    const response = await this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, name }),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async adminLogin(username: string, password: string): Promise<ApiResponse<{
    admin: any;
    token: string;
  }>> {
    const response = await this.request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async getProfile(): Promise<ApiResponse<{ user: any }>> {
    return this.request('/auth/profile');
  }

  async updateProfile(data: {
    name?: string;
    email?: string;
    avatar?: string;
  }): Promise<ApiResponse<{ user: any }>> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Listings methods
  async getListings(params: {
    type?: 'rent' | 'sale';
    category?: number;
    page?: number;
    limit?: number;
    search?: string;
    min_price?: number;
    max_price?: number;
    location?: string;
  } = {}): Promise<ApiResponse<{
    listings: any[];
    pagination: any;
  }>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/listings?${searchParams.toString()}`);
  }

  async getListing(id: string | number): Promise<ApiResponse<{ listing: any }>> {
    return this.request(`/listings/${id}`);
  }

  async createListing(data: {
    title: string;
    description: string;
    price: number;
    type: 'rent' | 'sale';
    category_id: number;
    images?: string[];
    location: string;
    condition?: string;
    year?: number;
    brand?: string;
    model?: string;
    specifications?: any;
  }): Promise<ApiResponse<{ listing: any }>> {
    return this.request('/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateListing(id: string | number, data: any): Promise<ApiResponse<{ listing: any }>> {
    return this.request(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteListing(id: string | number): Promise<ApiResponse> {
    return this.request(`/listings/${id}`, {
      method: 'DELETE',
    });
  }

  async getCategories(): Promise<ApiResponse<{ categories: any[] }>> {
    return this.request('/listings/categories/all');
  }

  // Favorites methods
  async getFavorites(): Promise<ApiResponse<{ favorites: any[] }>> {
    return this.request('/favorites');
  }

  async addToFavorites(listingId: number): Promise<ApiResponse> {
    return this.request('/favorites', {
      method: 'POST',
      body: JSON.stringify({ listing_id: listingId }),
    });
  }

  async removeFromFavorites(listingId: number): Promise<ApiResponse> {
    return this.request(`/favorites/${listingId}`, {
      method: 'DELETE',
    });
  }

  async toggleFavorite(listingId: number): Promise<ApiResponse<{ is_favorite: boolean }>> {
    return this.request('/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ listing_id: listingId }),
    });
  }

  // Admin methods
  async getAdminDashboard(): Promise<ApiResponse<{
    stats: any;
    recent_listings: any[];
    top_categories: any[];
    daily_stats: any[];
  }>> {
    return this.request('/admin/dashboard');
  }

  async getAdminListings(params: {
    page?: number;
    limit?: number;
    type?: 'rent' | 'sale';
    status?: 'active' | 'inactive';
    search?: string;
  } = {}): Promise<ApiResponse<{
    listings: any[];
    pagination: any;
  }>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/admin/listings?${searchParams.toString()}`);
  }

  async getAdminListing(id: string | number): Promise<ApiResponse<{
    listing: any;
    view_stats: any[];
  }>> {
    return this.request(`/admin/listings/${id}`);
  }

  async updateListingStatus(
    id: string | number,
    data: { is_active?: boolean; is_featured?: boolean }
  ): Promise<ApiResponse<{ listing: any }>> {
    return this.request(`/admin/listings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminListing(id: string | number): Promise<ApiResponse> {
    return this.request(`/admin/listings/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminUsers(params: {
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<{
    users: any[];
    pagination: any;
  }>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request(`/admin/users?${searchParams.toString()}`);
  }

  // Locations
  async getProvinces(): Promise<ApiResponse<{ provinces: any[] }>> {
    return this.request('/locations/provinces');
  }

  async getCities(provinceId: number): Promise<ApiResponse<{ cities: any[] }>> {
    return this.request(`/locations/cities/${provinceId}`);
  }

  // Logout
  logout() {
    this.setToken(null);
  }
}

// Create singleton instance
export const apiService = new ApiService();
export default apiService;
