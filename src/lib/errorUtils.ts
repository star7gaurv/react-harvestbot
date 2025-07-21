export interface ErrorInfo {
  message: string;
  type: "validation" | "network" | "server" | "auth" | "unknown";
  statusCode?: number;
}

export const categorizeError = (error: any): ErrorInfo => {
  // Default error info
  let errorInfo: ErrorInfo = {
    message: "An unexpected error occurred. Please try again.",
    type: "unknown",
  };

  if (!error) {
    return errorInfo;
  }

  // Network errors (axios)
  if (error.code === "NETWORK_ERROR" || error.code === "ECONNABORTED") {
    return {
      message: error.message || "Network error. Please check your connection.",
      type: "network",
    };
  }

  // Server response errors
  if (error.response) {
    const status = error.response.status;
    const serverMessage = error.response.data?.message;

    errorInfo.statusCode = status;

    switch (status) {
      case 400:
        errorInfo = {
          message: serverMessage || "Invalid request. Please check your input.",
          type: "validation",
          statusCode: status,
        };
        break;
      case 401:
        errorInfo = {
          message: serverMessage || "Invalid credentials. Please try again.",
          type: "auth",
          statusCode: status,
        };
        break;
      case 403:
        errorInfo = {
          message: serverMessage || "Access forbidden.",
          type: "auth",
          statusCode: status,
        };
        break;
      case 409:
        errorInfo = {
          message: serverMessage || "Resource already exists.",
          type: "validation",
          statusCode: status,
        };
        break;
      case 429:
        errorInfo = {
          message:
            serverMessage || "Too many requests. Please try again later.",
          type: "server",
          statusCode: status,
        };
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorInfo = {
          message: serverMessage || "Server error. Please try again later.",
          type: "server",
          statusCode: status,
        };
        break;
      default:
        errorInfo = {
          message: serverMessage || "An error occurred. Please try again.",
          type: "server",
          statusCode: status,
        };
        break;
    }
  }

  return errorInfo;
};

export const getErrorMessage = (error: any): string => {
  const errorInfo = categorizeError(error);
  return errorInfo.message;
};

export const isNetworkError = (error: any): boolean => {
  const errorInfo = categorizeError(error);
  return errorInfo.type === "network";
};

export const isValidationError = (error: any): boolean => {
  const errorInfo = categorizeError(error);
  return errorInfo.type === "validation";
};

export const isAuthError = (error: any): boolean => {
  const errorInfo = categorizeError(error);
  return errorInfo.type === "auth";
};
