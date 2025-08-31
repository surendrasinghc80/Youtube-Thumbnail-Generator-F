import { API_CONFIG, HTTP_STATUS, ERROR_MESSAGES } from "../../ApiConstants.js";
import authService from "./auth.js";

// API Service for Image Generation
class ImageGenerationService {
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
        // Handle authentication errors
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

  // Generate images from text prompt
  async generateImages(requestData) {
    const {
      prompt,
      enhancePrompt = false,
      category,
      mood,
      theme,
      primaryColor,
      includeText,
      textStyle,
      thumbnailStyle,
      customPrompt,
      imageCount = "4",
    } = requestData;

    // Basic validation
    if (!prompt && !customPrompt) {
      return {
        success: false,
        error: "Prompt or custom prompt is required",
      };
    }

    const payload = {
      prompt,
      enhancePrompt,
      category,
      mood,
      theme,
      primaryColor,
      includeText,
      textStyle,
      thumbnailStyle,
      customPrompt,
      imageCount,
    };

    return await this.makeAuthenticatedRequest(
      API_CONFIG.ENDPOINTS.GENERATE_IMAGES,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  // Generate images from uploaded image
  async generateFromImage(formData) {
    const url = `${this.baseURL}${API_CONFIG.ENDPOINTS.GENERATE_FROM_IMAGE}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          ...authService.getAuthHeaders(),
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData,
      });

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
      console.error("Image Generation Error:", error);
      return {
        success: false,
        error: error.message || ERROR_MESSAGES.NETWORK_ERROR,
        status: error.status || 500,
      };
    }
  }

  // Validate image file
  validateImageFile(file) {
    if (!file) {
      return { valid: false, error: "No file selected" };
    }

    if (file.size > API_CONFIG.UPLOAD.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size must be less than ${
          API_CONFIG.UPLOAD.MAX_FILE_SIZE / (1024 * 1024)
        }MB`,
      };
    }

    if (!API_CONFIG.UPLOAD.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: "Only JPEG, PNG, GIF, and WebP images are allowed",
      };
    }

    return { valid: true };
  }

  // Create FormData for image upload
  createImageFormData(file, requestData) {
    const formData = new FormData();
    formData.append("image", file);

    // Add other form fields
    Object.keys(requestData).forEach((key) => {
      if (requestData[key] !== undefined && requestData[key] !== null) {
        formData.append(key, requestData[key]);
      }
    });

    return formData;
  }
}

// Create and export a singleton instance
const imageGenerationService = new ImageGenerationService();
export default imageGenerationService;
