import React from 'react';
import { BotErrorLog } from '../types/errorLogs';

interface BotErrorLogsProps {
  botId?: string;
  errorLogs: BotErrorLog | BotErrorLog[];
  isLoading?: boolean;
  error?: string | null;
  showBotName?: boolean;
  maxErrors?: number;
}

const BotErrorLogs: React.FC<BotErrorLogsProps> = ({
  errorLogs,
  isLoading = false,
  error = null,
  showBotName = false,
  maxErrors = 5,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading error logs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-800 font-medium">Failed to load error logs</span>
        </div>
        <p className="text-red-700 mt-1 text-sm">{error}</p>
      </div>
    );
  }

  const botsArray = Array.isArray(errorLogs) ? errorLogs : [errorLogs];

  if (botsArray.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-green-800 font-medium">No errors detected</span>
        </div>
        <p className="text-green-700 mt-1 text-sm">All bots are running without errors</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {botsArray.map((bot) => (
        <div key={bot.bot_id} className="border rounded-lg overflow-hidden">
          {/* Bot Header */}
          {showBotName && (
            <div className="bg-gray-50 px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{bot.bot_name}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    bot.is_running 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {bot.is_running ? 'Running' : 'Stopped'}
                  </span>
                  {bot.process_id && (
                    <span className="text-xs text-gray-500">PID: {bot.process_id}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Logs Content */}
          <div className="p-4">
            {bot.has_errors ? (
              <div className="space-y-2">
                {/* Last Error (highlighted) */}
                {bot.last_error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">Latest Error:</p>
                        <p className="text-sm text-red-700 mt-1 font-mono">{bot.last_error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* All Error Logs */}
                {bot.error_logs.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-700">
                      Error History ({Math.min(bot.error_logs.length, maxErrors)} of {bot.error_logs.length})
                    </h4>
                    <div className="bg-gray-50 rounded border max-h-64 overflow-y-auto">
                      {bot.error_logs.slice(0, maxErrors).map((errorMsg, index) => (
                        <div 
                          key={index} 
                          className="px-3 py-2 text-sm text-gray-700 font-mono border-b border-gray-200 last:border-b-0 hover:bg-gray-100"
                        >
                          {errorMsg}
                        </div>
                      ))}
                    </div>
                    {bot.error_logs.length > maxErrors && (
                      <p className="text-xs text-gray-500 text-center py-2">
                        ... and {bot.error_logs.length - maxErrors} more errors
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-800 text-sm">No errors detected in recent logs</span>
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Last checked: {new Date(bot.log_timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BotErrorLogs;