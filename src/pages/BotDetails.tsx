import React, { useState } from "react";
import { StopCircle, Pause, Play, Download, Save, Trash2 } from "lucide-react";
import { Bot } from "../hooks/useBots";
import { useMemories } from "../hooks/useMemories";

interface BotDetailsProps {
  bot: Bot;
  onClose?: () => void;
  onStopBot?: () => void;
  onPauseBot?: () => void;
  onResumeBot?: () => void;
  onDeleteBot?: () => void;
  isDeleting?: boolean;
}

export const BotDetails: React.FC<BotDetailsProps> = ({
  bot,
  onStopBot,
  onPauseBot,
  onResumeBot,
  onDeleteBot,
  isDeleting = false,
}) => {
  const { createMemory } = useMemories();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Calculate buy/sell ratio from bot data
  const buySellRatio = bot.buyRatio.toFixed(1);
  const minMaxTime = `${bot.minTime} secs - ${bot.maxTime} secs`;
  const minMaxSpread = `${bot.minSpread
    .toString()
    .padStart(4, "0")} - ${bot.maxSpread.toString().padStart(5, "0")}`;
  const pauseVolume = bot.pauseVolume;

  const handleStopBot = () => {
    if (onStopBot) {
      onStopBot();
    }
  };

  const handlePauseBot = () => {
    if (onPauseBot) {
      onPauseBot();
    }
  };

  const handleResumeBot = () => {
    if (onResumeBot) {
      onResumeBot();
    }
  };

  const handleDeleteBot = () => {
    if (onDeleteBot) {
      onDeleteBot();
      setShowDeleteConfirm(false);
    }
  };

  const handleDownloadReport = () => {
    // Generate report data
    const reportData = {
      reportInfo: {
        title: "Bot Configuration Report",
        generatedAt: new Date().toISOString(),
        version: "1.0",
      },
      botConfiguration: {
        name: bot.name,
        exchangeType: bot.exchangeType,
        blockchain: bot.network,
        tradePair: bot.symbol,
        status: bot.status,
        settings: {
          buyRatio: bot.buyRatio,
          sellRatio: parseFloat((1 - bot.buyRatio).toFixed(1)),
          timing: {
            minTime: bot.minTime,
            maxTime: bot.maxTime,
            unit: "seconds",
          },
          spread: {
            minSpread: bot.minSpread,
            maxSpread: bot.maxSpread,
          },
          pauseVolume: bot.pauseVolume,
        },
      },
    };

    // Create JSON content
    const jsonContent = JSON.stringify(reportData, null, 2);

    // Create and download file
    const blob = new Blob([jsonContent], {
      type: "application/json;charset=utf-8;",
    });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${bot.name}_report_${new Date().toISOString().split("T")[0]}.json`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Determine bot state
  const isPaused = bot.status === "paused";
  const isStopped = bot.status === "inactive";
  const isActive = bot.status === "active";

  return (
    <div className="flex flex-col h-full">
      {/* Compact Header Section */}
      <div className="flex items-center gap-3 py-4 border-b border-gray-200">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <img
            src="/images/bot.svg"
            alt="bot avatar"
            className="w-6 h-6 filter brightness-0 invert"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate">{bot.name}</h2>
          <div className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
            bot.status === "active" 
              ? "bg-green-100 text-green-800" 
              : bot.status === "paused"
              ? "bg-yellow-100 text-yellow-800"
              : bot.status === "error"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}>
            {bot.status === "active" ? "Running" : 
             bot.status === "paused" ? "Paused" : 
             bot.status === "error" ? "Error" : "Stopped"}
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="flex-1 py-4 space-y-3 overflow-y-auto">
        {/* Trading Information */}
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Trading Information</h3>
          <div className="p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">Exchange</span>
              <span className="text-sm font-semibold text-gray-900">{bot.exchangeType}</span>
            </div>
          </div>

          <div className="p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">Network</span>
              <span className="text-sm font-semibold text-gray-900">{bot.network}</span>
            </div>
          </div>

          <div className="p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">Trade Pair</span>
              <span className="text-sm font-semibold text-gray-900">{bot.symbol}</span>
            </div>
          </div>
        </div>

        {/* Configuration Settings */}
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Configuration</h3>
          <div className="p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">Buy Ratio</span>
              <span className="text-sm font-semibold text-gray-900">{buySellRatio}</span>
            </div>
          </div>

          <div className="p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">Time Range</span>
              <span className="text-sm font-semibold text-gray-900">{minMaxTime}</span>
            </div>
          </div>

          <div className="p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">Spread Range</span>
              <span className="text-sm font-semibold text-gray-900">{minMaxSpread}</span>
            </div>
          </div>

          <div className="p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">Pause Volume</span>
              <span className="text-sm font-semibold text-gray-900">{pauseVolume}</span>
            </div>
          </div>

          <div className="p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">Wallet %</span>
              <span className="text-sm font-semibold text-gray-900">{bot.walletPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              isStopped 
                ? "text-gray-500 bg-gray-100 border border-gray-200 cursor-not-allowed" 
                : "text-red-600 bg-red-50 border border-red-200 hover:bg-red-100"
            }`}
            onClick={isStopped ? undefined : handleStopBot}
            disabled={isStopped}
          >
            <StopCircle className="w-4 h-4" />
            {isStopped ? "Stopped" : "Stop"}
          </button>
          {isPaused ? (
            <button
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              onClick={handleResumeBot}
            >
              <Play className="w-4 h-4" />
              Resume
            </button>
          ) : isStopped ? (
            <button
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              onClick={handleResumeBot}
            >
              <Play className="w-4 h-4" />
              Start
            </button>
          ) : (
            <button
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
              onClick={handlePauseBot}
            >
              <Pause className="w-4 h-4" />
              Pause
            </button>
          )}
        </div>

        {/* Secondary Actions */}
        <div className="space-y-2">
          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={handleDownloadReport}
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>

          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Bot
              </>
            )}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Delete Bot
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete "{bot.name}"? This action cannot
                be undone.
              </p>
              <div className="flex gap-3">
                <button
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                  onClick={handleDeleteBot}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
