import { useState, useEffect, useCallback } from "react";
import { botsAPI } from "../services/api";

export interface Bot {
  id: string;
  userId: string;
  name: string;
  symbol: string;
  status: "active" | "inactive" | "paused" | "error";
  network: string;
  exchangeType: "CEX" | "DEX";
  minTime: number;
  maxTime: number;
  minSpread: number;
  maxSpread: number;
  buyRatio: number;
  walletPercentage: number;
  pauseVolume: string;
  apiKey1?: string;
  apiSecret1?: string;
  apiKey2?: string;
  apiSecret2?: string;
  exchangeTypeValue?: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  uptime?: string;
}

export interface CreateBotData {
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
}

export const useBots = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await botsAPI.getAllBots();

      if (response.success && response.data) {
        // Ensure all bots have the correct structure
        const formattedBots = response.data.map((bot: any) => ({
          ...bot,
          id: bot.id || bot._id,
          createdAt: new Date(bot.createdAt),
          updatedAt: new Date(bot.updatedAt),
          startedAt: bot.startedAt ? new Date(bot.startedAt) : undefined,
        }));

        setBots(formattedBots);
      } else {
        const errorMessage = response.message || "Failed to fetch bots";
        setError(errorMessage);
        console.error("Bot fetch failed:", response);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch bots";
      setError(errorMessage);
      console.error("Error fetching bots:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createBot = useCallback(async (botData: CreateBotData) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Creating bot:", botData);

      const response = await botsAPI.createBot(botData);

      if (response.success && response.data) {
        // Check if there's an error in the response (bot created but failed to start)
        if (response.error) {
          setError(response.error);
          console.error("Bot created but failed to start:", response.error);

          // Still add the bot to the list since it was created
          const newBot = {
            ...response.data,
            id: response.data.id || response.data._id,
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt),
            startedAt: response.data.startedAt
              ? new Date(response.data.startedAt)
              : undefined,
          };

          setBots((prev) => [...prev, newBot]);
          return null; // Return null to indicate bot was created but not started
        }

        // Bot created and started successfully
        const newBot = {
          ...response.data,
          id: response.data.id || response.data._id,
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt),
          startedAt: response.data.startedAt
            ? new Date(response.data.startedAt)
            : undefined,
        };

        setBots((prev) => [...prev, newBot]);
        return newBot;
      } else {
        const errorMessage = response.message || "Failed to create bot";
        setError(errorMessage);
        console.error("Bot creation failed:", response);
        return null;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create bot";
      setError(errorMessage);
      console.error("Error creating bot:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBotStatus = useCallback(
    async (id: string, status: "active" | "inactive" | "paused" | "error") => {
      try {
        setError(null);
        const response = await botsAPI.updateBotStatus(id, status);

        if (response.success && response.data) {
          const updatedBot = {
            ...response.data,
            id: response.data.id || response.data._id,
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt),
            startedAt: response.data.startedAt
              ? new Date(response.data.startedAt)
              : undefined,
          };

          setBots((prev) =>
            prev.map((bot) =>
              bot.id === id
                ? {
                    ...bot,
                    status: updatedBot.status,
                    uptime: updatedBot.uptime,
                    startedAt: updatedBot.startedAt,
                    updatedAt: updatedBot.updatedAt,
                  }
                : bot
            )
          );
          return updatedBot;
        } else {
          const errorMessage =
            response.message || `Failed to ${status === 'active' ? 'start' : status === 'paused' ? 'pause' : 'stop'} bot`;
          setError(errorMessage);
          console.error("Bot status update failed:", response);
          return null;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : `Failed to ${status === 'active' ? 'start' : status === 'paused' ? 'pause' : 'stop'} bot`;
        setError(errorMessage);
        console.error("Error updating bot status:", err);
        return null;
      }
    },
    []
  );

  const updateBot = useCallback(
    async (id: string, botData: Partial<CreateBotData>) => {
      try {
        setError(null);
        const response = await botsAPI.updateBot(id, botData);

        if (response.success && response.data) {
          const updatedBot = {
            ...response.data,
            id: response.data.id || response.data._id,
            createdAt: new Date(response.data.createdAt),
            updatedAt: new Date(response.data.updatedAt),
            startedAt: response.data.startedAt
              ? new Date(response.data.startedAt)
              : undefined,
          };

          setBots((prev) =>
            prev.map((bot) => (bot.id === id ? { ...bot, ...updatedBot } : bot))
          );
          return updatedBot;
        } else {
          const errorMessage = response.message || "Failed to update bot";
          setError(errorMessage);
          console.error("Bot update failed:", response);
          return null;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update bot";
        setError(errorMessage);
        console.error("Error updating bot:", err);
        return null;
      }
    },
    []
  );

  const deleteBot = useCallback(async (id: string) => {
    try {
      setError(null);
      const response = await botsAPI.deleteBot(id);

      if (response.success) {
        setBots((prev) => prev.filter((bot) => bot.id !== id));
        return true;
      } else {
        const errorMessage = response.message || "Failed to delete bot";
        setError(errorMessage);
        console.error("Bot deletion failed:", response);
        return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete bot";
      setError(errorMessage);
      console.error("Error deleting bot:", err);
      return false;
    }
  }, []);

  const getBotById = useCallback(async (id: string) => {
    try {
      setError(null);
      const response = await botsAPI.getBotById(id);

      if (response.success && response.data) {
        const bot = {
          ...response.data,
          id: response.data.id || response.data._id,
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt),
          startedAt: response.data.startedAt
            ? new Date(response.data.startedAt)
            : undefined,
        };
        return bot;
      } else {
        const errorMessage = response.message || "Failed to fetch bot";
        setError(errorMessage);
        console.error("Bot fetch failed:", response);
        return null;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch bot";
      setError(errorMessage);
      console.error("Error fetching bot:", err);
      return null;
    }
  }, []);

  // Get bots by type
  const getCexBots = useCallback(() => {
    return bots.filter((bot) => bot.exchangeType === "CEX");
  }, [bots]);

  const getDexBots = useCallback(() => {
    return bots.filter((bot) => bot.exchangeType === "DEX");
  }, [bots]);

  // Get bots by status
  const getActiveBots = useCallback(() => {
    return bots.filter((bot) => bot.status === "active");
  }, [bots]);

  const getPausedBots = useCallback(() => {
    return bots.filter((bot) => bot.status === "paused");
  }, [bots]);

  const getErrorBots = useCallback(() => {
    return bots.filter((bot) => bot.status === "error");
  }, [bots]);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  return {
    bots,
    loading,
    error,
    fetchBots,
    createBot,
    updateBotStatus,
    updateBot,
    deleteBot,
    getBotById,
    getCexBots,
    getDexBots,
    getActiveBots,
    getPausedBots,
    getErrorBots,
  };
};
