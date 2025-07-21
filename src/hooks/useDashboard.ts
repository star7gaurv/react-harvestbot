import { useState, useEffect, useCallback } from "react";
import { dashboardAPI } from "../services/api";

export interface DashboardStats {
  totalBots: number;
  activeBots: number;
  pausedBots: number;
  tradePairs: number;
  activeCexBots: number;
  activeDexBots: number;
  cexExchanges: number;
  dexExchanges: number;
  systemUptime: string;
  activeBotsUptime: string;
  dexBotsUptime: string;
  cexBotsUptime: string;
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardAPI.getStats();
      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.message);
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
