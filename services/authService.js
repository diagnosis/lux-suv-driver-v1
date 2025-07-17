import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG, { API_ENDPOINTS, buildUrl, getHeaders, handleApiError } from '@/config/api';

class AuthService {
  constructor() {
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor to add auth token
    axios.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('jwt_token');
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  async login(credentials) {
    try {
      const response = await axios.post(buildUrl(API_ENDPOINTS.LOGIN), credentials, {
        headers: getHeaders(),
        timeout: API_CONFIG.TIMEOUT,
      });

      const { token, user } = response.data;
      
      if (token) {
        await AsyncStorage.setItem('jwt_token', token);
        await AsyncStorage.setItem('user_data', JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async register(userData) {
    try {
      const response = await axios.post(buildUrl(API_ENDPOINTS.REGISTER), userData, {
        headers: getHeaders(),
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async forgotPassword(email) {
    try {
      const response = await axios.post(buildUrl(API_ENDPOINTS.FORGOT_PASSWORD), { email }, {
        headers: getHeaders(),
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async resetPassword(resetToken, newPassword) {
    try {
      const response = await axios.post(buildUrl(API_ENDPOINTS.RESET_PASSWORD), {
        reset_token: resetToken,
        new_password: newPassword,
      }, {
        headers: getHeaders(),
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getProfile() {
    try {
      const response = await axios.get(buildUrl(API_ENDPOINTS.PROFILE), {
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      const response = await axios.put(buildUrl(API_ENDPOINTS.CHANGE_PASSWORD), {
        current_password: currentPassword,
        new_password: newPassword,
      }, {
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async logout() {
    try {
      await AsyncStorage.multiRemove(['jwt_token', 'user_data']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem('jwt_token');
      return !!token;
    } catch (error) {
      return false;
    }
  }

  async getStoredUser() {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }
}

export default new AuthService();