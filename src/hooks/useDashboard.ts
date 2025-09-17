import { useState, useEffect, useCallback } from "react";
import { dashboardAPI } from "../services/api";

export interface DashboardStats {
  // Core
  totalBots?: number;
  activeBots?: number;
  inactiveBots?: number;
  pausedBots?: number;
  errorBots?: number;
  // New metric from API
  totalMemories?: number;
  // Legacy/extended metrics (optional in case API doesn't provide them)
  tradePairs?: number;
  activeCexBots?: number;
  activeDexBots?: number;
  cexExchanges?: number;
  dexExchanges?: number;
  // Uptime metrics
  systemUptime?: string;
  activeBotsUptime?: string;
  dexBotsUptime?: string;
  cexBotsUptime?: string;
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  // Start in loading state to avoid initial empty flash
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Normalize various possible API response shapes to DashboardStats
  const normalizeStats = (response: any): { data?: DashboardStats; message?: string } => {
    // Fill defaults so UI always has values
    const withDefaults = (obj: any): DashboardStats => ({
      totalBots: 0,
      activeBots: 0,
      inactiveBots: 0,
      pausedBots: 0,
      errorBots: 0,
      totalMemories: 0,
      tradePairs: 0,
      activeCexBots: 0,
      activeDexBots: 0,
      cexExchanges: 0,
      dexExchanges: 0,
      systemUptime: "00:00:00",
      activeBotsUptime: "00:00:00",
      dexBotsUptime: "00:00:00",
      cexBotsUptime: "00:00:00",
      ...(obj || {}),
    });

    if (!response) return { message: "Empty response" };

    // Typical shape: { success: true, data: {...} }
    if (response.success === true && response.data && typeof response.data === "object") {
      return { data: withDefaults(response.data) };
    }

    // Shape: { data: {...} }
    if (response.data && typeof response.data === "object") {
      return { data: withDefaults(response.data) };
    }

    // Shape: { stats: {...} }
    if (response.stats && typeof response.stats === "object") {
      return { data: withDefaults(response.stats) };
    }

    // Shape: { ...expected fields }
    const maybeStats = response as Partial<DashboardStats>;
    const hasKey = (k: keyof DashboardStats) => Object.prototype.hasOwnProperty.call(maybeStats, k);
    if (
      hasKey("totalBots") ||
      hasKey("activeBots") ||
      hasKey("pausedBots") ||
      hasKey("tradePairs")
    ) {
      return { data: withDefaults(response) };
    }

    if (response.success === false) {
      return { message: response.message || "Request failed" };
    }

    return { message: "Unexpected response format" };
  };

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardAPI.getStats();
      const { data, message } = normalizeStats(response);
      if (data) {
        setStats(data);
      } else {
        setStats(null);
        setError(message || "Failed to fetch dashboard stats");
      }
    } catch (err) {
      setError("Failed to fetch dashboard stats");
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    fetchStats,
  };
};
