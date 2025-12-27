import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token expiration
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_profile');
    }
  }

  getUserProfile(): any {
    if (typeof window === 'undefined') return null;
    const profile = localStorage.getItem('user_profile');
    return profile ? JSON.parse(profile) : null;
  }

  setUserProfile(profile: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_profile', JSON.stringify(profile));
    }
  }

  // Auth endpoints
  async sendOTP(phone: string) {
    const response = await this.client.post('/auth/start', { phone });
    return response.data;
  }

  async verifyOTP(phone: string, code: string) {
    const response = await this.client.post('/auth/verify', { phone, code });
    const { accessToken, user } = response.data;
    this.setToken(accessToken);
    this.setUserProfile(user);
    return response.data;
  }

  async logout() {
    this.clearToken();
  }

  // Jobs endpoints
  async createJob(jobData: any) {
    const response = await this.client.post('/jobs', jobData);
    return response.data;
  }

  async getMyJobs() {
    const response = await this.client.get('/jobs/my-jobs');
    return response.data;
  }

  async getJob(id: string) {
    const response = await this.client.get(`/jobs/${id}`);
    return response.data;
  }

  async publishJob(id: string) {
    const response = await this.client.post(`/jobs/${id}/transition`, {
      newStatus: 'published',
    });
    return response.data;
  }

  // Profiles/Search endpoints
  async searchProfiles(params: {
    latitude?: number;
    longitude?: number;
    radius?: number;
    skills?: string[];
    availability?: {
      dateType: string;
      timeSlot: string;
    };
  }) {
    const response = await this.client.post('/search/profiles', params);
    return response.data;
  }

  async getProfile(id: string) {
    const response = await this.client.get(`/profiles/${id}`);
    return response.data;
  }

  // Matches endpoints
  async createMatch(jobId: string, candidateId: string) {
    const response = await this.client.post('/matches', {
      jobId,
      candidateId,
    });
    return response.data;
  }

  async getJobMatches(jobId: string) {
    const response = await this.client.get(`/matches/job/${jobId}`);
    return response.data;
  }

  async confirmMatch(matchId: string, availabilityId: string) {
    const response = await this.client.post(`/matches/${matchId}/confirm`, {
      availabilityId,
    });
    return response.data;
  }

  // Reviews endpoints
  async createReview(reviewData: any) {
    const response = await this.client.post('/reviews', reviewData);
    return response.data;
  }

  async getProfileReviews(profileId: string) {
    const response = await this.client.get(`/reviews/profile/${profileId}`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
