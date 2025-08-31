import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES } from "../../ApiConstants.js";
import authService from "./auth.js";

// API Service for Generation History
class HistoryService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Helper method to make authenticated API requests
  async makeAuthenticatedRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      method: "GET",
      headers: {
        ...API_CONFIG.HEADERS,
        ...authService.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === HTTP_STATUS.UNAUTHORIZED) {
          authService.logout();
          throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
        }
        throw new Error(data.error || data.message || "Request failed");
      }

      return {
        success: true,
        data,
        status: response.status,
      };
    } catch (error) {
      console.error("API Request Error:", error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.NETWORK_ERROR,
        status: error.status || 500,
      };
    }
  }

  // Get generation history
  async getHistory(limit = 20, offset = 0) {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const endpoint = `${API_CONFIG.ENDPOINTS.GET_HISTORY}?${queryParams}`;
    return await this.makeAuthenticatedRequest(endpoint);
  }

  // Delete specific history entry
  async deleteHistoryEntry(historyId) {
    if (!historyId) {
      return {
        success: false,
        error: "History ID is required",
      };
    }

    const endpoint = `${API_CONFIG.ENDPOINTS.DELETE_HISTORY_ENTRY}/${historyId}`;
    return await this.makeAuthenticatedRequest(endpoint, {
      method: "DELETE",
    });
  }

  // Clear all history
  async clearHistory() {
    return await this.makeAuthenticatedRequest(
      API_CONFIG.ENDPOINTS.CLEAR_HISTORY,
      {
        method: "DELETE",
      }
    );
  }
}

// Create and export a singleton instance
const historyService = new HistoryService();
export default historyService;
