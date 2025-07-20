import axios from 'axios';
import * as Location from 'expo-location';
import API_CONFIG, { buildUrl, getHeaders, handleApiError } from '@/config/api';
import { TRACKING_ENDPOINTS, createWebSocketUrl } from '@/config/tracking';

class TrackingService {
  constructor() {
    this.webSocket = null;
    this.isTracking = false;
    this.locationSubscription = null;
  }

  // Driver Navigation Methods
  async getNavigationInfo(bookingId, token) {
    try {
      const endpoint = TRACKING_ENDPOINTS.DRIVER_NAVIGATION.replace('{bookingId}', bookingId);
      const response = await axios.get(buildUrl(endpoint), {
        headers: getHeaders(token),
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getAlternativeNavigation(bookingId, token) {
    try {
      const endpoint = TRACKING_ENDPOINTS.DRIVER_NAVIGATION_ALT.replace('{bookingId}', bookingId);
      const response = await axios.get(buildUrl(endpoint), {
        headers: getHeaders(token),
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Tracking Session Methods
  async startTrackingSession(bookingId, token) {
    try {
      const endpoint = TRACKING_ENDPOINTS.START_TRACKING.replace('{bookingId}', bookingId);
      const response = await axios.post(buildUrl(endpoint), {}, {
        headers: getHeaders(token),
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async stopTrackingSession(bookingId, token) {
    try {
      const endpoint = TRACKING_ENDPOINTS.STOP_TRACKING.replace('{bookingId}', bookingId);
      const response = await axios.post(buildUrl(endpoint), {}, {
        headers: getHeaders(token),
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateLocation(locationData, token) {
    try {
      const response = await axios.post(buildUrl(TRACKING_ENDPOINTS.UPDATE_LOCATION), locationData, {
        headers: getHeaders(token),
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Rider Tracking Methods
  async getLiveTracking(bookingId, token) {
    try {
      const endpoint = TRACKING_ENDPOINTS.LIVE_TRACKING.replace('{bookingId}', bookingId);
      const response = await axios.get(buildUrl(endpoint), {
        headers: getHeaders(token),
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getComprehensiveTracking(bookingId, token) {
    try {
      const endpoint = TRACKING_ENDPOINTS.COMPREHENSIVE_TRACKING.replace('{bookingId}', bookingId);
      const response = await axios.get(buildUrl(endpoint), {
        headers: getHeaders(token),
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Admin/Dispatcher Methods
  async getActiveSessions(token) {
    try {
      const response = await axios.get(buildUrl(TRACKING_ENDPOINTS.ACTIVE_SESSIONS), {
        headers: getHeaders(token),
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getActiveRides(token) {
    try {
      const response = await axios.get(buildUrl(TRACKING_ENDPOINTS.ACTIVE_RIDES), {
        headers: getHeaders(token),
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Location Services
  async requestLocationPermissions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }
      return true;
    } catch (error) {
      throw new Error('Failed to get location permissions');
    }
  }

  async getCurrentLocation() {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return location;
    } catch (error) {
      throw new Error('Failed to get current location');
    }
  }

  startLocationTracking(bookingId, token, onLocationUpdate, onError) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.requestLocationPermissions();
        
        this.locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, // Update every 5 seconds
            distanceInterval: 10, // Update every 10 meters
          },
          async (location) => {
            try {
              const locationData = {
                booking_id: bookingId,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy || 5.0,
                speed: location.coords.speed || 0,
                heading: location.coords.heading || 0,
              };

              await this.updateLocation(locationData, token);
              onLocationUpdate && onLocationUpdate(locationData);
            } catch (error) {
              onError && onError(error);
            }
          }
        );
        
        this.isTracking = true;
        resolve(this.locationSubscription);
      } catch (error) {
        reject(error);
      }
    });
  }

  stopLocationTracking() {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
    this.isTracking = false;
  }

  // WebSocket Methods
  connectWebSocket(userId, role, bookingId, onMessage, onError, onClose) {
    try {
      const wsUrl = createWebSocketUrl(API_CONFIG.BASE_URL, userId, role, bookingId);
      console.log('Connecting to WebSocket:', wsUrl);
      
      this.webSocket = new WebSocket(wsUrl);
      
      this.webSocket.onopen = () => {
        console.log('WebSocket connected');
      };
      
      this.webSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage && onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.webSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError && onError(error);
      };
      
      this.webSocket.onclose = () => {
        console.log('WebSocket disconnected');
        onClose && onClose();
      };
      
      return this.webSocket;
    } catch (error) {
      throw new Error('Failed to connect WebSocket');
    }
  }

  disconnectWebSocket() {
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }
  }

  // Cleanup method
  cleanup() {
    this.stopLocationTracking();
    this.disconnectWebSocket();
  }
}

export default new TrackingService();