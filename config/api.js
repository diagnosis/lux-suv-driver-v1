// API Configuration for LuxSUV Driver App
const API_CONFIG = {
  BASE_URL: __DEV__ ? 'https://luxsuv-v4.onrender.com' : 'https://luxsuv-v4.onrender.com',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  
  // User management
  PROFILE: '/users/me',
  CHANGE_PASSWORD: '/users/me/password',
  
  // Regular Driver endpoints
  DRIVER_ASSIGNED_BOOKINGS: '/driver/bookings/assigned',
  ACCEPT_BOOKING: '/driver/bookings',
  
  // Super Driver endpoints
  SUPER_DRIVER_AVAILABLE_BOOKINGS: '/super-driver/bookings/available',
  SUPER_DRIVER_ASSIGN_BOOKING: '/super-driver/bookings',
  SUPER_DRIVER_DRIVER_BOOKINGS: '/super-driver/bookings/driver',
  
  // Dispatcher endpoints
  DISPATCHER_ALL_BOOKINGS: '/dispatcher/bookings/all',
  DISPATCHER_AVAILABLE_BOOKINGS: '/dispatcher/bookings/available',
  DISPATCHER_ASSIGN_BOOKING: '/dispatcher/bookings',
  DISPATCHER_DRIVER_BOOKINGS: '/dispatcher/bookings/driver',
  
  // Management endpoints (for both dispatcher and super-driver)
  MANAGEMENT_AVAILABLE_BOOKINGS: '/management/bookings/available',
  MANAGEMENT_DRIVER_BOOKINGS: '/management/bookings/driver',
  
  // Booking management
  BOOK_RIDE: '/book-ride',
  MY_BOOKINGS: '/bookings/my',
  UPDATE_BOOKING: '/bookings',
  CANCEL_BOOKING: '/bookings',
  
  // Admin endpoints
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_BY_EMAIL: '/admin/users/by-email',
  ADMIN_UPDATE_ROLE: '/admin/users',
  
  // Health check
  HEALTH: '/health',
  
  // Tracking endpoints
  DRIVER_NAVIGATION: '/driver/bookings/{bookingId}/navigation',
  DRIVER_NAVIGATION_ALT: '/driver/tracking/bookings/{bookingId}/navigation',
  START_TRACKING: '/driver/tracking/bookings/{bookingId}/start',
  STOP_TRACKING: '/driver/tracking/bookings/{bookingId}/stop',
  UPDATE_LOCATION: '/driver/tracking/location',
  LIVE_TRACKING: '/tracking/bookings/{bookingId}/live',
  COMPREHENSIVE_TRACKING: '/tracking/bookings/{bookingId}',
  TRACKING_STATUS: '/tracking/bookings/{bookingId}/status',
  ACTIVE_SESSIONS: '/admin/tracking/sessions/active',
  ACTIVE_RIDES: '/admin/tracking/rides/active',
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

// Request headers
export const getHeaders = (token = null, contentType = 'application/json') => {
  const headers = {
    'Content-Type': contentType,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// Build full URL
export const buildUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Error handling
export const handleApiError = (error) => {
  console.log('Handling API error:', error);
  
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    console.log('Server error response:', { status, data });
    
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return 'Session expired. Please login again.';
      case HTTP_STATUS.FORBIDDEN:
        return 'Access denied. Insufficient permissions.';
      case HTTP_STATUS.NOT_FOUND:
        return 'Resource not found.';
      case HTTP_STATUS.TOO_MANY_REQUESTS:
        return 'Too many requests. Please try again later.';
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return 'Server error. Please try again later.';
      default:
        return data?.error || data?.message || 'An error occurred';
    }
  } else if (error.request) {
    // Network error
    console.log('Network error:', error.request);
    return 'Network error. Please check your connection.';
  } else {
    // Other error
    console.log('Other error:', error.message);
    return error.message || 'An unexpected error occurred';
  }
};

export default API_CONFIG;