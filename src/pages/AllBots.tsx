import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { BotDetails } from "./BotDetails";
import { LiveLogsModal } from "../components/LiveLogsModal";
import { useBots, Bot as BotType } from "../hooks/useBots";

const AllBots: React.FC = () => {
  const [selectedBot, setSelectedBot] = useState<BotType | null>(null);
  const [showLiveLogsModal, setShowLiveLogsModal] = useState(false);
  const [logsBot, setLogsBot] = useState<BotType | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [stopAllLoading, setStopAllLoading] = useState<{
    cex: boolean;
    dex: boolean;
  }>({ cex: false, dex: false });
  const { bots, loading, error, updateBotStatus, fetchBots, deleteBot } =
    useBots();

  // Mobile sidebar toggle
  const [menuOpen, setMenuOpen] = useState(false);

  // Tick every second to refresh uptime display
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSeconds = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const handleBotClick = (bot: BotType) => {
    setSelectedBot(bot);
  };

  const handleViewLiveLogs = (bot: BotType, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent bot card click
    setLogsBot(bot);
    setShowLiveLogsModal(true);
  };

  const handleStopBot = async (botId: string) => {
    try {
      setActionLoading(botId);
      const result = await updateBotStatus(botId, "inactive");

      if (result) {
        // Update the selected bot if it's the one being stopped
        if (selectedBot?.id === botId) {
          setSelectedBot({ ...selectedBot, status: "inactive" });
        }
        toast.success("Bot stopped successfully!");
      } else {
        toast.error("Failed to stop bot. Please try again.");
      }
    } catch (error) {
      console.error("Error stopping bot:", error);
      toast.error("Failed to stop bot. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePauseBot = async (botId: string) => {
    try {
      setActionLoading(botId);
      const result = await updateBotStatus(botId, "paused");

      if (result) {
        // Update the selected bot if it's the one being paused
        if (selectedBot?.id === botId) {
          setSelectedBot({ ...selectedBot, status: "paused" });
        }
        toast.success("Bot paused successfully!");
      } else {
        toast.error("Failed to pause bot. Please try again.");
      }
    } catch (error) {
      console.error("Error pausing bot:", error);
      toast.error("Failed to pause bot. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartBot = async (botId: string) => {
    try {
      setActionLoading(botId);
      const result = await updateBotStatus(botId, "active");

      if (result) {
        // Update the selected bot if it's the one being started
        if (selectedBot?.id === botId) {
          setSelectedBot({ ...selectedBot, status: "active" });
        }
        toast.success("Bot started successfully!");
      } else {
        toast.error("Failed to start bot. Please try again.");
      }
    } catch (error) {
      console.error("Error starting bot:", error);
      toast.error("Failed to start bot. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefreshBots = async () => {
    try {
      await fetchBots();
    } catch (error) {
      console.error("Error refreshing bots:", error);
      toast.error("Failed to refresh bots. Please try again.");
    }
  };

  const handleDeleteBot = async (botId: string) => {
    try {
      setActionLoading(botId);
      const result = await deleteBot(botId);

      if (result) {
        // Clear selected bot if it's the one being deleted
        if (selectedBot?.id === botId) {
          setSelectedBot(null);
        }
        toast.success("Bot deleted successfully!");
      } else {
        toast.error("Failed to delete bot. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting bot:", error);
      toast.error("Failed to delete bot. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStopAllCEXBots = async () => {
    try {
      setStopAllLoading((prev) => ({ ...prev, cex: true }));
      const cexBots = bots.filter(
        (bot) => bot.exchangeType === "CEX" && bot.status === "active"
      );

      if (cexBots.length === 0) {
        toast.success("No active CEX bots to stop.");
        return;
      }

      const promises = cexBots.map((bot) =>
        updateBotStatus(bot.id, "inactive")
      );
      const results = await Promise.all(promises);

      const successCount = results.filter((result) => result).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(
          `Successfully stopped ${successCount} CEX bot${
            successCount !== 1 ? "s" : ""
          }.`
        );

        // Update selected bot if it was stopped
        if (
          selectedBot?.exchangeType === "CEX" &&
          selectedBot?.status === "active"
        ) {
          setSelectedBot({ ...selectedBot, status: "inactive" });
        }
      }

      if (failCount > 0) {
        toast.error(
          `Failed to stop ${failCount} CEX bot${failCount !== 1 ? "s" : ""}.`
        );
      }
    } catch (error) {
      console.error("Error stopping all CEX bots:", error);
      toast.error("Failed to stop CEX bots. Please try again.");
    } finally {
      setStopAllLoading((prev) => ({ ...prev, cex: false }));
    }
  };

  const handleStopAllDEXBots = async () => {
    try {
      setStopAllLoading((prev) => ({ ...prev, dex: true }));
      const dexBots = bots.filter(
        (bot) => bot.exchangeType === "DEX" && bot.status === "active"
      );

      if (dexBots.length === 0) {
        toast.success("No active DEX bots to stop.");
        return;
      }

      const promises = dexBots.map((bot) =>
        updateBotStatus(bot.id, "inactive")
      );
      const results = await Promise.all(promises);

      const successCount = results.filter((result) => result).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(
          `Successfully stopped ${successCount} DEX bot${
            successCount !== 1 ? "s" : ""
          }.`
        );

        // Update selected bot if it was stopped
        if (
          selectedBot?.exchangeType === "DEX" &&
          selectedBot?.status === "active"
        ) {
          setSelectedBot({ ...selectedBot, status: "inactive" });
        }
      }

      if (failCount > 0) {
        toast.error(
          `Failed to stop ${failCount} DEX bot${failCount !== 1 ? "s" : ""}.`
        );
      }
    } catch (error) {
      console.error("Error stopping all DEX bots:", error);
      toast.error("Failed to stop DEX bots. Please try again.");
    } finally {
      setStopAllLoading((prev) => ({ ...prev, dex: false }));
    }
  };

  const renderBotCard = (bot: BotType, isSelected = false) => {
    const statusColor = bot.status === "active" ? "#ffd700" : "#ff4757";
    const statusText =
      bot.status === "active"
        ? "Running"
        : bot.status === "paused"
        ? "Paused"
        : bot.status === "error"
        ? "Error"
        : "Stopped";

    // Live uptime: persisted uptimeSeconds + elapsed since startedAt if active
    const baseUptime = typeof bot.uptimeSeconds === "number" ? bot.uptimeSeconds : 0;
    let uptimeText = "00:00:00";
    if (bot.status === "active" && bot.startedAt) {
      const startTs = new Date(bot.startedAt).getTime();
      const diffSeconds = Math.max(0, Math.floor((now - startTs) / 1000));
      uptimeText = formatSeconds(baseUptime + diffSeconds);
    } else {
      uptimeText = formatSeconds(baseUptime);
    }

    // Format date and time
    const dateStarted = bot.startedAt
      ? new Date(bot.startedAt).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
        })
      : new Date(bot.createdAt).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
        });

    const timeStarted = bot.startedAt
      ? new Date(bot.startedAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : new Date(bot.createdAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

    return (
      <div
        key={bot.id}
        className={`relative bg-gradient-to-t from-[#09203F] to-[#537895] rounded-[20px] p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
          isSelected ? "ring-2 ring-blue-400 ring-offset-2 shadow-lg" : ""
        } ${actionLoading === bot.id ? "opacity-75 pointer-events-none" : ""} ${
          bot.status === "active" ? "hover:ring-2 hover:ring-green-400 hover:ring-offset-2" : ""
        }`}
        onClick={() => !actionLoading && handleBotClick(bot)}
        title="Click to view bot details"
      >
        {/* Live indicator for running bots */}
        {bot.status === "active" && (
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs font-medium">LIVE</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-start gap-5">
          <div className="flex flex-col gap-2 items-center">
            <div className="relative">
              <img
                src="/images/bot.svg"
                alt="any bot"
                className="w-12 h-12 p-2 bg-white rounded-full"
              />
              {bot.status === "active" && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <span className="text-white text-base font-medium">{bot.name}</span>
          </div>

          <div className="text-left">
            <div
              className="text-2xl font-medium text-white"
              style={{ color: statusColor }}
            >
              {uptimeText}
            </div>
            <div className="text-2xl text-white flex items-center gap-2">
              {statusText}
              {bot.status === "active" && (
                <button
                  onClick={(e) => handleViewLiveLogs(bot, e)}
                  className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-full animate-pulse transition-all duration-200 cursor-pointer hover:scale-105 transform hover:shadow-lg font-medium border border-green-400"
                  title="View live logs"
                >View Logs</button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 mt-5 gap-2 text-white">
          <div className="flex flex-col justify-between items-start">
            <span className="text-white/80">Exchange</span>
            <span className="text-lg">{bot.network}</span>
          </div>
          <div className="flex flex-col justify-between items-end">
            <span className="text-white/80">Trade Pair</span>
            <span className="text-lg">{bot.symbol}</span>
          </div>
          <div className="flex flex-col justify-between items-start">
            <span className="text-white/80">Date Started</span>
            <span className="text-lg">{dateStarted}</span>
          </div>
          <div className="flex flex-col justify-between items-end">
            <span className="text-white/80">Time started</span>
            <span className="text-lg">{timeStarted}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-[#e8e8ff] via-[#f0e8ff] to-[#e8f0ff] p-4 gap-4">
        <Sidebar />
        <div className="flex flex-col w-full gap-4 h-full">
          <div className="flex-shrink-0">
            <Navbar title="All Bots" />
          </div>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading bots...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-[#e8e8ff] via-[#f0e8ff] to-[#e8f0ff] p-4 gap-4">
        <Sidebar />
        <div className="flex flex-col w-full gap-4 h-full">
          <div className="flex-shrink-0">
            <Navbar title="All Bots" />
          </div>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <p className="text-lg font-semibold">Error Loading Bots</p>
                <p className="text-sm text-gray-600 mt-2">{error}</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleRefreshBots}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cexBots = bots.filter((bot) => bot.exchangeType === "CEX");
  const dexBots = bots.filter((bot) => bot.exchangeType === "DEX");

  const activeCEXBotsCount = cexBots.filter(
    (bot) => bot.status === "active"
  ).length;
  const activeDEXBotsCount = dexBots.filter(
    (bot) => bot.status === "active"
  ).length;

  const stopAllActions = (
    <>
      <button
        onClick={handleStopAllCEXBots}
        disabled={stopAllLoading.cex || activeCEXBotsCount === 0}
        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {stopAllLoading.cex ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <span>⏹</span>
        )}
        Stop All CEX Bots
      </button>
      <button
        onClick={handleStopAllDEXBots}
        disabled={stopAllLoading.dex || activeDEXBotsCount === 0}
        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {stopAllLoading.dex ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <span>⏹</span>
        )}
        Stop All DEX Bots
      </button>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#e8e8ff] via-[#f0e8ff] to-[#e8f0ff] p-3 sm:p-4 gap-3 sm:gap-4">
      {/* Sidebar */}
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Main Content */}
      <div className="flex flex-col w-full gap-3 sm:gap-4">
        {/* Fixed Navbar */}
        <div className="flex-shrink-0">
          <Navbar title="All Bots" actions={stopAllActions} onMenuClick={() => setMenuOpen(true)} />
        </div>

        {/* Content Area */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 flex-1 min-h-0">
          {/* Scrollable All Bots Content */}
          <div className="flex flex-col bg-white rounded-[24px] md:rounded-[32px] w-full lg:w-3/4 h-full overflow-hidden p-4 md:p-5">
            {/* Header with refresh button */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-4">
                <button
                  onClick={handleRefreshBots}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  )}
                  Refresh
                </button>
              </div>
              <div className="text-sm text-gray-500">
                {bots.length} bot{bots.length !== 1 ? "s" : ""} total
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto hide-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {/* Centralized Bots */}
              <div className="mb-8">
                <h2 className="text-xl font-base text-gray-600 mb-4">
                  Centralised Bots
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {cexBots.map((bot) =>
                    renderBotCard(bot, selectedBot?.id === bot.id)
                  )}
                </div>
              </div>

              {/* Decentralized Bots */}
              <div>
                <h2 className="text-xl font-base text-gray-600 mb-4">
                  Decentralised Bots
                </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {dexBots.map((bot) => renderBotCard(bot))}
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Bot Details Sidebar */}
      <div className="w-full lg:w-1/4 bg-white rounded-[24px] md:rounded-[32px] h-full flex flex-col p-4 md:p-6">
            {selectedBot ? (
              <BotDetails
                bot={selectedBot}
                onStopBot={() => handleStopBot(selectedBot.id)}
                onPauseBot={() => handlePauseBot(selectedBot.id)}
                onResumeBot={() => handleStartBot(selectedBot.id)}
                onDeleteBot={() => handleDeleteBot(selectedBot.id)}
                isDeleting={actionLoading === selectedBot.id}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
                <img
                  src="/images/any-bots.svg"
                  alt="any bot"
                  className="w-12 h-12"
                />
                <p>Any bot created in this session will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Live Logs Modal */}
        {showLiveLogsModal && logsBot && (
          <LiveLogsModal
            bot={logsBot}
            isOpen={showLiveLogsModal}
            onClose={() => {
              setShowLiveLogsModal(false);
              setLogsBot(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AllBots;
