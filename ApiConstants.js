// Authentication APIs
export const AuthApi = {
  Login: "/api/login", // POST
  Signup: "/api/signup", // POST
};

// Image Generation APIs
export const ImageApi = {
  Generate: "/api/generate", // POST - Text-to-image generation
  GenerateFromImage: "/api/generate-from-image", // POST - Image-to-image generation (with file upload)
};

// History APIs
export const HistoryApi = {
  GetHistory: "/api/history", // GET - Get user generation history (supports limit & offset query params)
  DeleteEntry: "/api/history", // DELETE - Delete specific history entry (append /:historyId)
  ClearHistory: "/api/history", // DELETE - Clear all history
};

// Utility APIs
export const UtilityApi = {
  Health: "/health", // GET - Health check endpoint
};

// Helper function to build history delete URL
export const buildHistoryDeleteUrl = (historyId) =>
  `${HistoryApi.DeleteEntry}/${historyId}`;

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  HEADERS: {
    "Content-Type": "application/json",
  },
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: AuthApi.Login,
    SIGNUP: AuthApi.Signup,
    // Image generation endpoints
    GENERATE_IMAGES: ImageApi.Generate,
    GENERATE_FROM_IMAGE: ImageApi.GenerateFromImage,
    // History endpoints
    GET_HISTORY: HistoryApi.GetHistory,
    DELETE_HISTORY_ENTRY: HistoryApi.DeleteEntry,
    CLEAR_HISTORY: HistoryApi.ClearHistory,
    // Utility endpoints
    HEALTH: UtilityApi.Health,
  },
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ],
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "Session expired. Please login again.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  FILE_TOO_LARGE: "File size exceeds the maximum limit.",
  INVALID_FILE_TYPE: "Invalid file type. Please select a valid image.",
};
