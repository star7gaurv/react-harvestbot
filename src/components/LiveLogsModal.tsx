import React, { useState, useEffect, useRef } from 'react';
import { X, RefreshCw, Play, Pause, Download, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { botsAPI } from '../services/api';
import { Bot } from '../hooks/useBots';
import { BotErrorLog } from '../types/errorLogs';

interface LiveLogsModalProps {
  bot: Bot;
  isOpen: boolean;
  onClose: () => void;
}

export const LiveLogsModal: React.FC<LiveLogsModalProps> = ({
  bot,
  isOpen,
  onClose,
}) => {
  const [logs, setLogs] = useState<BotErrorLog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5); // 5 seconds
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      const response = await botsAPI.getBotErrorLogs(bot.id, 100); // Get more lines for live logs
      setLogs(response);
      setLastRefresh(new Date());
      
      // Auto-scroll to bottom if there are new logs
      if (logsEndRef.current) {
        logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error('Failed to fetch bot logs:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to fetch logs');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const startAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      fetchLogs(false); // Don't show loading spinner for auto-refresh
    }, refreshInterval * 1000);
  };

  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Initial fetch and setup auto-refresh
  useEffect(() => {
    if (isOpen) {
      fetchLogs();
      if (isAutoRefresh) {
        startAutoRefresh();
      }
    }

    return () => {
      stopAutoRefresh();
    };
  }, [isOpen, isAutoRefresh, refreshInterval]);

  // Handle auto-refresh toggle
  useEffect(() => {
    if (isAutoRefresh) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  }, [isAutoRefresh, refreshInterval]);

  const handleManualRefresh = () => {
    fetchLogs(true);
  };

  const handleDownloadLogs = () => {
    if (!logs) return;

    const logData = {
      bot_info: {
        id: logs.bot_id,
        name: logs.bot_name,
        is_running: logs.is_running,
        process_id: logs.process_id,
        timestamp: logs.log_timestamp,
      },
      error_summary: {
        has_errors: logs.has_errors,
        total_errors: logs.error_logs.length,
        last_error: logs.last_error,
      },
      error_logs: logs.error_logs,
      export_timestamp: new Date().toISOString(),
    };

    const jsonContent = JSON.stringify(logData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${bot.name}_logs_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = () => {
    if (!logs) return null;
    
    if (logs.is_running) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (logs.has_errors) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    } else {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    if (!logs) return 'Unknown';
    
    if (logs.is_running) {
      return 'Running';
    } else if (logs.has_errors) {
      return 'Stopped with Errors';
    } else {
      return 'Stopped';
    }
  };

  const getStatusColor = () => {
    if (!logs) return 'text-gray-500';
    
    if (logs.is_running) {
      return 'text-green-600';
    } else if (logs.has_errors) {
      return 'text-red-600';
    } else {
      return 'text-yellow-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img
                src="/images/bot.svg"
                alt="bot"
                className="w-8 h-8 p-1 bg-blue-100 rounded-full"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{bot.name}</h2>
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <span className={`text-sm font-medium ${getStatusColor()}`}>
                    {getStatusText()}
                  </span>
                  {logs?.process_id && (
                    <span className="text-xs text-gray-500">
                      PID: {logs.process_id}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto-refresh controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                  isAutoRefresh
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {isAutoRefresh ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                Auto-refresh
              </button>
              
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-2 py-1 text-sm border border-gray-300 rounded"
                disabled={!isAutoRefresh}
              >
                <option value={2}>2s</option>
                <option value={5}>5s</option>
                <option value={10}>10s</option>
                <option value={30}>30s</option>
              </select>
            </div>

            {/* Manual refresh */}
            <button
              onClick={handleManualRefresh}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {/* Download logs */}
            <button
              onClick={handleDownloadLogs}
              disabled={!logs}
              className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 text-sm"
            >
              <Download className="w-3 h-3" />
              Export
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Trading Pair: <span className="font-medium text-gray-900">{bot.symbol}</span>
              </span>
              <span className="text-gray-600">
                Exchange: <span className="font-medium text-gray-900">{bot.network}</span>
              </span>
              {logs?.has_errors && (
                <span className="text-red-600">
                  Errors: <span className="font-medium">{logs.error_logs.length}</span>
                </span>
              )}
            </div>
            {lastRefresh && (
              <span className="text-gray-500">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Logs content */}
        <div className="flex-1 overflow-hidden">
          {isLoading && !logs ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600">Loading logs...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-800 mb-2">Failed to Load Logs</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={handleManualRefresh}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : logs ? (
            <div className="h-full flex flex-col">
              {/* Latest error highlight */}
              {logs.has_errors && logs.last_error && (
                <div className="p-4 bg-red-50 border-b border-red-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-red-800">Latest Error:</h4>
                      <p className="text-red-700 text-sm font-mono mt-1">{logs.last_error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Log entries */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-900 text-green-400 font-mono text-sm">
                {logs.error_logs.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    {logs.is_running ? (
                      <div>
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        <p className="text-lg text-green-400">Bot is running smoothly</p>
                        <p className="text-green-300">No errors detected in recent logs</p>
                      </div>
                    ) : (
                      <div>
                        <XCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                        <p className="text-lg text-yellow-400">Bot is not running</p>
                        <p className="text-yellow-300">No error logs available</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {logs.error_logs.map((log, index) => (
                      <div key={index} className="flex">
                        <span className="text-gray-500 mr-4 select-none">
                          {String(index + 1).padStart(3, '0')}
                        </span>
                        <span className={`break-all ${
                          log.toLowerCase().includes('error') || 
                          log.toLowerCase().includes('failed') ||
                          log.toLowerCase().includes('exception')
                            ? 'text-red-400' 
                            : log.toLowerCase().includes('warning')
                            ? 'text-yellow-400'
                            : 'text-green-400'
                        }`}>
                          {log}
                        </span>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>Live Logs View</span>
              {isAutoRefresh && (
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Auto-refreshing every {refreshInterval}s
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span>Showing last 100 log entries</span>
              {logs && (
                <span>• {logs.error_logs.length} entries loaded</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};