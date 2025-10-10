import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL || 'https://pbot.cryptoin1.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different types of errors
    if (error.code === "ECONNABORTED") {
      // Timeout error
      error.message = "Request timeout. Please try again.";
    } else if (!error.response) {
      // Network error
      error.code = "NETWORK_ERROR";
      error.message = "Network error. Please check your connection.";
    } else {
      // Server error with response
      switch (error.response.status) {
        case 401:
          // Only clear auth data if we're not on login/signup pages
          if (
            !window.location.pathname.includes("/login") &&
            !window.location.pathname.includes("/signup")
          ) {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            window.location.href = "/login";
          }
          break;
        case 403:
          error.message = "Access forbidden. Please check your permissions.";
          break;
        case 404:
          error.message = "Resource not found.";
          break;
        case 429:
          error.message = "Too many requests. Please try again later.";
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          error.message = "Server error. Please try again later.";
          break;
        default:
          break;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post("/auth/login", { username, password });
    return response.data;
  },

  signup: async (userData: { username: string; password: string }) => {
    try {
      const response = await api.post("/auth/signup", userData);
      
      // Handle both success responses (201) and other valid responses
      if (response.status === 201 || response.status === 200) {
        return response.data;
      } else {
        throw new Error(response.data?.message || "Signup failed");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      
      // Re-throw with proper error structure
      if (error.response?.data) {
        throw error; // Preserve the original error with response data
      } else {
        throw new Error(error.message || "Network error occurred");
      }
    }
  },

  verifyToken: async () => {
    const response = await api.get("/auth/verify");
    return response.data;
  },

  validateLBankCredentials: async (apiKey: string, secretKey: string) => {
    const response = await api.post("/auth/validate-lbank", {
      apiKey,
      secretKey,
    });
    return response.data;
  },

  getLBankCredentials: async () => {
    const response = await api.get("/auth/credentials");
    return response.data;
  },

  getLBankAccountInfo: async (apiKey: string) => {
    const response = await api.post("/auth/lbank-account-info", { apiKey });
    return response.data;
  },
};

// Bots API
export const botsAPI = {
  getAllBots: async () => {
    const username = localStorage.getItem("username");
    const response = await api.get(`/bots?username=${username}`);
    return response.data;
  },

  createBot: async (botData: {
    name: string;
    symbol: string;
    network: string;
    exchangeType: "CEX" | "DEX";
    minTime: number;
    maxTime: number;
    minSpread: number;
    maxSpread: number;
    buyRatio: number;
    walletPercentage: number;
    pauseVolume: number;
    apiKey1?: string;
    apiSecret1?: string;
    apiKey2?: string;
    apiSecret2?: string;
    exchangeTypeValue?: string;
  }) => {
    const response = await api.post("/bots", botData);
    return response.data;
  },

  getBotById: async (id: string) => {
    const response = await api.get(`/bots/${id}`);
    return response.data;
  },

  updateBotStatus: async (
    id: string,
    status: "active" | "inactive" | "paused" | "error"
  ) => {
  // Use a higher timeout for start/stop operations which may take longer
  const response = await api.patch(`/bots/${id}/status`, { status }, { timeout: 30000 });
    return response.data;
  },

  updateBot: async (
    id: string,
    botData: {
      name?: string;
      symbol?: string;
      network?: string;
      exchangeType?: "CEX" | "DEX";
      minTime?: number;
      maxTime?: number;
      minSpread?: number;
      maxSpread?: number;
      buyRatio?: number;
      walletPercentage?: number;
      pauseVolume?: number;
      apiKey1?: string;
      apiSecret1?: string;
      apiKey2?: string;
      apiSecret2?: string;
      exchangeTypeValue?: string;
    }
  ) => {
    const response = await api.put(`/bots/${id}`, botData);
    return response.data;
  },

  deleteBot: async (id: string) => {
    const response = await api.delete(`/bots/${id}`);
    return response.data;
  },
  // Optional: direct start endpoint (backend returns quickly; frontend can poll process_status)
  startBot: async (id: string) => {
    const response = await api.post(`/bots/${id}/start`, undefined, { timeout: 30000 });
    return response.data;
  },

  // Optional: poll actual process status
  getProcessStatus: async (id: string) => {
    const response = await api.get(`/bots/${id}/process_status`);
    return response.data;
  },

  // Get live error logs for a specific bot
  getBotErrorLogs: async (id: string, lines: number = 50) => {
    const response = await api.get(`/bots/${id}/error-logs?lines=${lines}`);
    return response.data;
  },

  // Get error logs for all user bots
  getAllBotsErrorLogs: async (lines: number = 30, onlyErrors: boolean = true) => {
    const response = await api.get(`/bots/error-logs?lines=${lines}&only_errors=${onlyErrors}`);
    return response.data;
  },
};

// Memories API
export const memoriesAPI = {
  getAllMemories: async () => {
    const response = await api.get("/bots/memories/all");
    return response.data;
  },

  getMemoryById: async (id: string) => {
    const response = await api.get(`/bots/memories/${id}`);
    return response.data;
  },

  useMemory: async (id: string) => {
    const response = await api.post(`/bots/memories/${id}/use`);
    return response.data;
  },

  createMemory: async (memoryData: {
    name: string;
    network: string;
    symbol: string;
    exchangeType: "CEX" | "DEX";
    minTime: number;
    maxTime: number;
    minSpread: number;
    maxSpread: number;
    buyRatio: number;
    walletPercentage: number;
    pauseVolume: number;
    exchangeTypeValue?: string;
  }) => {
    const response = await api.post("/bots/memories", memoryData);
    return response.data;
  },

  deleteMemory: async (id: string) => {
    const response = await api.delete(`/bots/memories/${id}`);
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get("/bots/dashboard/stats");
    return response.data;
  },
};

export default api;
