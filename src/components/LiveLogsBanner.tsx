import React from 'react';
import { Activity, Eye } from 'lucide-react';

interface LiveLogsBannerProps {
  botName: string;
  onViewLogs: () => void;
  onClose: () => void;
}

export const LiveLogsBanner: React.FC<LiveLogsBannerProps> = ({
  botName,
  onViewLogs,
  onClose,
}) => {
  return (
    <div className="fixed top-4 right-4 z-40 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg shadow-lg p-4 max-w-sm animate-slide-in-right">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm">Bot is Running!</h4>
            <p className="text-xs text-green-100 mt-1">
              {botName} is actively trading
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 ml-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="mt-3 flex gap-2">
        <button
          onClick={onViewLogs}
          className="flex items-center gap-1 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-xs font-medium transition-colors"
        >
          <Eye className="w-3 h-3" />
          View Live Logs
        </button>
      </div>
    </div>
  );
};