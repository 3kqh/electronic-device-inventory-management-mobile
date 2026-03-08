import { RegisterData, RegisterResponse, SignInResponse } from '../types/api';
import { apiClient } from './apiClient';

// ============================================================
// Auth Service
// ============================================================

export const authService = {
  /**
   * Sign in with email and password.
   * POST /api/auth/signin
   */
  async signIn(email: string, password: string): Promise<SignInResponse> {
    const response = await apiClient.post<SignInResponse>('/auth/signin', {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Sign out the current user.
   * POST /api/auth/signout
   */
  async signOut(): Promise<void> {
    await apiClient.post<void>('/auth/signout');
  },

  /**
   * Get the current user's profile.
   * GET /api/auth/me
   */
  async getProfile(): Promise<SignInResponse['user']> {
    const response = await apiClient.get<SignInResponse['user']>('/auth/me');
    return response.data;
  },

  /**
   * Register a new user (admin only).
   * POST /api/auth/register
   */
  async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },
};
