import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG, { handleApiError } from '@/config/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    
    // Log request for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    // Log error response
    console.error(`API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.multiRemove(['jwt_token', 'user_data']);
        // You might want to redirect to login screen here
        // This would depend on your navigation setup
      } catch (storageError) {
        console.error('Error clearing storage:', storageError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Retry logic for failed requests
const retryRequest = async (originalRequest, retryCount = 0) => {
  if (retryCount >= API_CONFIG.RETRY_ATTEMPTS) {
    throw originalRequest;
  }
  
  // Wait before retrying
  await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * (retryCount + 1)));
  
  try {
    return await apiClient(originalRequest);
  } catch (error) {
    return retryRequest(originalRequest, retryCount + 1);
  }
};

// Enhanced request method with retry logic
export const makeRequest = async (config) => {
  try {
    return await apiClient(config);
  } catch (error) {
    // Only retry on network errors or 5xx server errors
    if (!error.response || error.response.status >= 500) {
      try {
        return await retryRequest(config);
      } catch (retryError) {
        throw error; // Throw original error if retry fails
      }
    }
    throw error;
  }
};

// Convenience methods
export const get = (url, config = {}) => makeRequest({ method: 'GET', url, ...config });
export const post = (url, data, config = {}) => makeRequest({ method: 'POST', url, data, ...config });
export const put = (url, data, config = {}) => makeRequest({ method: 'PUT', url, data, ...config });
export const del = (url, config = {}) => makeRequest({ method: 'DELETE', url, ...config });

export default apiClient;