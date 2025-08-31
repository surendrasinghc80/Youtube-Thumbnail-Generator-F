import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES } from "../../ApiConstants.js";

// API Service for Authentication
class AuthService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Helper method to make API requests
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      method: "GET",
      headers: {
        ...API_CONFIG.HEADERS,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
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

  // User Registration
  async signup(userData) {
    const { name, email, password } = userData;

    // Basic validation
    if (!name || !email || !password) {
      return {
        success: false,
        error: "Name, email, and password are required",
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters long",
      };
    }

    return await this.makeRequest(API_CONFIG.ENDPOINTS.SIGNUP, {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  }

  // User Login
  async login(credentials) {
    const { email, password } = credentials;

    // Basic validation
    if (!email || !password) {
      return {
        success: false,
        error: "Email and password are required",
      };
    }

    return await this.makeRequest(API_CONFIG.ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  // Store token in localStorage and set cookie for middleware
  storeToken(token) {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
      // Set cookie for middleware to read
      document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    }
  }

  // Get token from localStorage
  getToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  }

  // Remove token from localStorage and clear cookie
  removeToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      // Clear cookie
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }

  // Get authorization headers
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Logout user
  logout() {
    this.removeToken();
    // Redirect to login page or home page
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
