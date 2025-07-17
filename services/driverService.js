import axios from 'axios';
import API_CONFIG, { API_ENDPOINTS, buildUrl, getHeaders, handleApiError } from '@/config/api';

class DriverService {
  async getDriverBookings() {
    try {
      const response = await axios.get(buildUrl(API_ENDPOINTS.DRIVER_BOOKINGS), {
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getAssignedBookings() {
    try {
      const response = await axios.get(buildUrl(API_ENDPOINTS.ASSIGNED_BOOKINGS), {
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