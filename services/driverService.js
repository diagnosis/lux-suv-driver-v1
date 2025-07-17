import axios from 'axios';
import API_CONFIG, { API_ENDPOINTS, buildUrl, getHeaders, handleApiError } from '@/config/api';

class DriverService {
  // Regular Driver Methods
  async getAssignedBookings() {
    try {
      const response = await axios.get(buildUrl(API_ENDPOINTS.DRIVER_ASSIGNED_BOOKINGS), {
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async acceptBooking(bookingId) {
    try {
      const response = await axios.put(buildUrl(`${API_ENDPOINTS.ACCEPT_BOOKING}/${bookingId}/accept`), {}, {
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Super Driver Methods
  async getAvailableBookings() {
    try {
      const response = await axios.get(buildUrl(API_ENDPOINTS.SUPER_DRIVER_AVAILABLE_BOOKINGS), {
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async assignBookingToDriver(bookingId, driverId, notes = '') {
    try {
      const response = await axios.post(buildUrl(`${API_ENDPOINTS.SUPER_DRIVER_ASSIGN_BOOKING}/${bookingId}/assign`), {
        driver_id: driverId,
        notes: notes,
      }, {
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getDriverBookings(driverId, status = 'all') {
    try {
      const url = status === 'all' 
        ? `${API_ENDPOINTS.SUPER_DRIVER_DRIVER_BOOKINGS}/${driverId}`
        : `${API_ENDPOINTS.SUPER_DRIVER_DRIVER_BOOKINGS}/${driverId}?status=${status}`;
      
      const response = await axios.get(buildUrl(url), {
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Dispatcher Methods
  async getAllBookings() {
    try {
      const response = await axios.get(buildUrl(API_ENDPOINTS.DISPATCHER_ALL_BOOKINGS), {
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getDispatcherAvailableBookings() {
    try {
      const response = await axios.get(buildUrl(API_ENDPOINTS.DISPATCHER_AVAILABLE_BOOKINGS), {
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async dispatcherAssignBooking(bookingId, driverId, notes = '') {
    try {
      const response = await axios.post(buildUrl(`${API_ENDPOINTS.DISPATCHER_ASSIGN_BOOKING}/${bookingId}/assign`), {
        driver_id: driverId,
        notes: notes,
      }, {
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getDispatcherDriverBookings(driverId, status = 'all') {
    try {
      const url = status === 'all' 
        ? `${API_ENDPOINTS.DISPATCHER_DRIVER_BOOKINGS}/${driverId}`
        : `${API_ENDPOINTS.DISPATCHER_DRIVER_BOOKINGS}/${driverId}?status=${status}`;
      
      const response = await axios.get(buildUrl(url), {
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Management Methods (for both dispatcher and super-driver)
  async getManagementAvailableBookings() {
    try {
      const response = await axios.get(buildUrl(API_ENDPOINTS.MANAGEMENT_AVAILABLE_BOOKINGS), {
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getManagementDriverBookings(driverId, status = 'all') {
    try {
      const url = status === 'all' 
        ? `${API_ENDPOINTS.MANAGEMENT_DRIVER_BOOKINGS}/${driverId}`
        : `${API_ENDPOINTS.MANAGEMENT_DRIVER_BOOKINGS}/${driverId}?status=${status}`;
      
      const response = await axios.get(buildUrl(url), {
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Common Methods
  async updateBookingStatus(bookingId, status) {
    try {
      const response = await axios.put(buildUrl(`${API_ENDPOINTS.UPDATE_BOOKING}/${bookingId}/status`), {
        status,
      }, {
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getBookingDetails(bookingId) {
    try {
      const response = await axios.get(buildUrl(`${API_ENDPOINTS.UPDATE_BOOKING}/${bookingId}`), {
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new DriverService();