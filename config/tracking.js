// Tracking-specific API endpoints
export const TRACKING_ENDPOINTS = {
  // Driver tracking endpoints
  DRIVER_NAVIGATION: '/driver/bookings/{bookingId}/navigation',
  DRIVER_NAVIGATION_ALT: '/driver/tracking/bookings/{bookingId}/navigation',
  START_TRACKING: '/driver/tracking/bookings/{bookingId}/start',
  STOP_TRACKING: '/driver/tracking/bookings/{bookingId}/stop',
  UPDATE_LOCATION: '/driver/tracking/location',
  
  // Rider tracking endpoints
  LIVE_TRACKING: '/tracking/bookings/{bookingId}/live',
  COMPREHENSIVE_TRACKING: '/tracking/bookings/{bookingId}',
  TRACKING_STATUS: '/tracking/bookings/{bookingId}/status',
  
  // Admin/Dispatcher tracking endpoints
  ACTIVE_SESSIONS: '/admin/tracking/sessions/active',
  ACTIVE_RIDES: '/admin/tracking/rides/active',
  
  // WebSocket endpoint
  WEBSOCKET: '/ws/tracking',
};

// WebSocket connection utility
export const createWebSocketUrl = (baseUrl, userId, role, bookingId = null) => {
  const wsUrl = baseUrl.replace('https://', 'wss://').replace('http://', 'ws://');
  let url = `${wsUrl}${TRACKING_ENDPOINTS.WEBSOCKET}?user_id=${userId}&role=${role}`;
  
  if (bookingId) {
    url += `&booking_id=${bookingId}`;
  }
  
  return url;
};

// Map app URLs
export const MAP_APPS = {
  GOOGLE_MAPS: 'google_maps',
  APPLE_MAPS: 'apple_maps',
  WAZE: 'waze',
};

export const MAP_APP_NAMES = {
  [MAP_APPS.GOOGLE_MAPS]: 'Google Maps',
  [MAP_APPS.APPLE_MAPS]: 'Apple Maps',
  [MAP_APPS.WAZE]: 'Waze',
};