import axios from 'axios';
import API_CONFIG, { API_ENDPOINTS, buildUrl, getHeaders, handleApiError } from '@/config/api';

class BookingService {
  async createBooking(bookingData) {
    try {
      const response = await axios.post(buildUrl(API_ENDPOINTS.BOOK_RIDE), bookingData, {
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getMyBookings() {
    try {
      const response = await axios.get(buildUrl(API_ENDPOINTS.MY_BOOKINGS), {
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateBooking(bookingId, updateData) {
    try {
      const response = await axios.put(buildUrl(`${API_ENDPOINTS.UPDATE_BOOKING}/${bookingId}`), updateData, {
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async cancelBooking(bookingId, reason) {
    try {
      const response = await axios.delete(buildUrl(`${API_ENDPOINTS.CANCEL_BOOKING}/${bookingId}/cancel`), {
        data: { reason },
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getBookingsByEmail(email) {
    try {
      const response = await axios.get(buildUrl(`/bookings/email/${encodeURIComponent(email)}`), {
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async requestUpdateLink(bookingId, email) {
    try {
      const response = await axios.post(buildUrl(`${API_ENDPOINTS.UPDATE_BOOKING}/${bookingId}/update-link`), {
        email,
      }, {
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new BookingService();