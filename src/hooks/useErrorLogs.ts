import { useState, useEffect, useCallback } from 'react';
import { botsAPI } from '../services/api';
import { BotErrorLog, UseBotErrorLogsReturn, UseAllBotsErrorLogsReturn } from '../types/errorLogs';

// Hook for getting error logs for a specific bot
export const useBotErrorLogs = (botId: string, lines: number = 50): UseBotErrorLogsReturn => {
  const [errorLogs, setErrorLogs] = useState<BotErrorLog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchErrorLogs = useCallback(async () => {
    if (!botId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await botsAPI.getBotErrorLogs(botId, lines);
      setErrorLogs(response);
    } catch (err: any) {
      console.error('Failed to fetch bot error logs:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to fetch error logs');
    } finally {
      setIsLoading(false);
    }
  }, [botId, lines]);

  useEffect(() => {
    fetchErrorLogs();
  }, [fetchErrorLogs]);

  return {
    errorLogs,
    isLoading,
    error,
    refetch: fetchErrorLogs,
  };
};

// Hook for getting error logs for all user bots
export const useAllBotsErrorLogs = (
  lines: number = 30, 
  onlyErrors: boolean = true,
  autoRefresh: boolean = false,
  refreshInterval: number = 30000 // 30 seconds
): UseAllBotsErrorLogsReturn => {
  const [errorLogs, setErrorLogs] = useState<BotErrorLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllErrorLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await botsAPI.getAllBotsErrorLogs(lines, onlyErrors);
      setErrorLogs(response);
    } catch (err: any) {
      console.error('Failed to fetch all bots error logs:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to fetch error logs');
    } finally {
      setIsLoading(false);
    }
  }, [lines, onlyErrors]);

  useEffect(() => {
    fetchAllErrorLogs();
  }, [fetchAllErrorLogs]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAllErrorLogs();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchAllErrorLogs]);

  return {
    errorLogs,
    isLoading,
    error,
    refetch: fetchAllErrorLogs,
  };
};

// Hook for real-time error monitoring (polling)
export const useRealTimeErrorMonitoring = (
  refreshInterval: number = 30000, // 30 seconds
  enabled: boolean = true
) => {
  const [hasNewErrors, setHasNewErrors] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const { errorLogs, isLoading, error, refetch } = useAllBotsErrorLogs(30, true, enabled, refreshInterval);

  useEffect(() => {
    if (errorLogs.length > 0) {
      const currentErrorCount = errorLogs.filter(bot => bot.has_errors).length;
      
      if (lastChecked && currentErrorCount > errorCount) {
        setHasNewErrors(true);
      }
      
      setErrorCount(currentErrorCount);
      setLastChecked(new Date());
    }
  }, [errorLogs, lastChecked, errorCount]);

  const clearNewErrorsFlag = () => {
    setHasNewErrors(false);
  };

  return {
    errorLogs,
    isLoading,
    error,
    hasNewErrors,
    errorCount,
    lastChecked,
    clearNewErrorsFlag,
    refetch,
  };
};