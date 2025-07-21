import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authAPI } from "../services/api";

interface User {
  id: string;
  username: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  verifyAuth: () => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.login(username, password);
      if (response.success && response.token && response.username) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("username", response.username);

        // Check if we already have an address for this user
        const existingAddress = localStorage.getItem(
          `address_${response.username}`
        );
        const userAddress = existingAddress || "";

        if (!existingAddress) {
          localStorage.setItem(`address_${response.username}`, userAddress);
        }

        const userData: User = {
          id: response.username,
          username: response.username,
        };

        setUser(userData);
        return true;
      } else {
        setError(response.message || "Login failed");
        return false;
      }
    } catch (err: any) {
      console.error("Login error:", err);

      let errorMessage = "Login failed. Please try again.";

      if (err.response) {
        // Server responded with error status
        if (err.response.status === 401) {
          errorMessage = "Invalid username or password";
        } else if (err.response.status === 429) {
          errorMessage = "Too many login attempts. Please try again later.";
        } else if (err.response.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = err.response.data?.message || errorMessage;
        }
      } else if (err.request) {
        // Network error
        errorMessage = "Network error. Please check your connection.";
      }

      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.signup({ username, password });
      
      // Check for success field or HTTP 201 status (created)
      if ((response.success !== false && response.token && response.username) || 
          (response.token && response.username)) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("username", response.username);

        const userData: User = {
          id: response.username,
          username: response.username,
        };

        setUser(userData);
        setError(null); // Clear any previous errors
        return true;
      } else {
        const errorMessage = response.message || "Signup failed";
        setError(errorMessage);
        return false;
      }
    } catch (err: any) {
      console.error("Signup error:", err);

      let errorMessage = "Signup failed. Please try again.";

      if (err.response) {
        // Server responded with error status
        if (err.response.status === 409) {
          errorMessage =
            "Username already exists. Please choose a different username.";
        } else if (err.response.status === 400) {
          errorMessage =
            err.response.data?.message ||
            "Invalid input. Please check your details.";
        } else if (err.response.status === 429) {
          errorMessage = "Too many signup attempts. Please try again later.";
        } else if (err.response.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = err.response.data?.message || errorMessage;
        }
      } else if (err.request) {
        // Network error
        errorMessage = "Network error. Please check your connection.";
      }

      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUser(null);
    setError(null);
  };

  const verifyAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    if (!token || !username) {
      setLoading(false);
      return false;
    }

    try {
      const response = await authAPI.verifyToken();
      if (response.success) {
        // Get the stored address for this user

        const userData: User = {
          id: username,
          username: username,
        };
        setUser(userData);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (err) {
      logout();
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyAuth();
  }, []);

  const value: UserContextType = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    verifyAuth,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
