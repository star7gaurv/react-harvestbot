// Example: Error Dashboard Component for monitoring all bots

import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, Bot, CheckCircle, XCircle } from 'lucide-react';
import { useAllBotsErrorLogs, useRealTimeErrorMonitoring } from '../hooks/useErrorLogs';
import BotErrorLogs from '../components/BotErrorLogs';

const ErrorDashboard: React.FC = () => {
  const [showOnlyErrors, setShowOnlyErrors] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Use real-time monitoring for notifications
  const {
    errorLogs,
    isLoading,
    error,
    hasNewErrors,
    errorCount,
    lastChecked,
    clearNewErrorsFlag,
    refetch
  } = useRealTimeErrorMonitoring(30000, autoRefresh); // Check every 30 seconds

  // Statistics
  const totalBots = errorLogs.length;
  const runningBots = errorLogs.filter(bot => bot.is_running).length;
  const stoppedBots = totalBots - runningBots;
  const botsWithErrors = errorLogs.filter(bot => bot.has_errors).length;

  const handleRefresh = () => {
    refetch();
    clearNewErrorsFlag();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              Bot Error Monitor
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time monitoring of bot errors and status
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Auto-refresh toggle */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Auto-refresh (30s)</span>
            </label>

            {/* Manual refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* New errors notification */}
        {hasNewErrors && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-red-800 font-medium">New errors detected!</span>
              </div>
              <button
                onClick={clearNewErrorsFlag}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bots</p>
              <p className="text-2xl font-bold text-gray-900">{totalBots}</p>
            </div>
            <Bot className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Running</p>
              <p className="text-2xl font-bold text-green-600">{runningBots}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stopped</p>
              <p className="text-2xl font-bold text-red-600">{stoppedBots}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">With Errors</p>
              <p className="text-2xl font-bold text-orange-600">{botsWithErrors}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlyErrors}
              onChange={(e) => setShowOnlyErrors(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show only bots with errors</span>
          </label>
        </div>

        {lastChecked && (
          <p className="text-sm text-gray-500">
            Last updated: {lastChecked.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Error Status Overview */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-800 font-medium">Failed to load error logs</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Bot Error Logs */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Bot Error Logs {showOnlyErrors && botsWithErrors > 0 && `(${botsWithErrors} with errors)`}
          </h2>
        </div>
        
        <div className="p-6">
          {isLoading && errorLogs.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600">Loading error logs...</span>
            </div>
          ) : (
            <BotErrorLogs
              errorLogs={showOnlyErrors ? errorLogs.filter(bot => bot.has_errors) : errorLogs}
              isLoading={isLoading}
              error={error}
              showBotName={true}
              maxErrors={3} // Show fewer errors per bot in overview
            />
          )}
        </div>
      </div>

      {/* Summary Footer */}
      {!isLoading && errorLogs.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Monitoring {totalBots} bot{totalBots !== 1 ? 's' : ''} • 
              {runningBots} running • 
              {botsWithErrors} with errors
            </span>
            <span>
              Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorDashboard;