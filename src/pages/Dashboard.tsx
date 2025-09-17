import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { StatCardLayout } from "../components/StatCardLayout";
import { useDashboard } from "../hooks/useDashboard";

const Dashboard: React.FC = () => {
  const { stats, loading, error, fetchStats } = useDashboard();
  // Light 1s tick to keep any uptime strings feeling live; optionally refetch every 30s
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    const ref = setInterval(() => fetchStats(), 30000);
    return () => { clearInterval(t); clearInterval(ref); };
  }, [fetchStats]);

  // Safely format numeric stats without throwing on undefined
  const nStr = (n?: number | null) => ((n ?? 0).toString());

  const statsCards = [
    {
      title: "Total Bots",
  value: nStr(stats?.totalBots),
      image: "/images/all-bots.svg",
      startColor: "#f093fb",
      endColor: "#f5576c",
    },
    {
      title: "Active Bots",
  value: nStr(stats?.activeBots),
      image: "/images/active-bots.svg",
      startColor: "#30cfd0",
      endColor: "#330867",
    },
    {
      title: "Inactive Bots",
      value: nStr(stats?.inactiveBots),
      image: "/images/paused-bots.svg",
      startColor: "#a1c4fd",
      endColor: "#c2e9fb",
    },
    {
      title: "Bots Paused",
  value: nStr(stats?.pausedBots),
      image: "/images/paused-bots.svg",
      startColor: "#feada6",
      endColor: "#f5efef",
    },
    {
      title: "Error Bots",
      value: nStr(stats?.errorBots),
      image: "/images/shield-security.svg",
      startColor: "#f6d365",
      endColor: "#fda085",
    },
    {
      title: "Trade Pairs",
  value: nStr(stats?.tradePairs),
      image: "/images/trade-pairs.svg",
      startColor: "#88d3ce",
      endColor: "#6e45e2",
    },
    {
      title: "Total Memories",
      value: nStr(stats?.totalMemories),
      image: "/images/saved-memories.svg",
      startColor: "#ebbba7",
      endColor: "#cfc7f8",
    },
  ];

  const exchangeCards = [
    {
      title: "Active CEX Bots",
  value: nStr(stats?.activeCexBots),
      image: "/images/cex-bots.svg",
      startColor: "#a8edea",
      endColor: "#fed6e3",
    },
    {
      title: "Active DEX Bots",
  value: nStr(stats?.activeDexBots),
      image: "/images/dex-bots.svg",
      startColor: "#d299c2",
      endColor: "#fef9d7",
    },
    {
      title: "CEX Exchanges",
  value: nStr(stats?.cexExchanges),
      image: "/images/cex.svg",
      startColor: "#89f7fe",
      endColor: "#66a6ff",
    },
    {
      title: "DEX Exchanges",
  value: nStr(stats?.dexExchanges),
      image: "/images/dex.svg",
      startColor: "#fdbb2d",
      endColor: "#22c1c3",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-[#e8e8ff] via-[#f0e8ff] to-[#e8f0ff] p-4 gap-4">
        <Sidebar />
        <div className="flex flex-col w-full gap-3">
          <Navbar title="Dashboard" />
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-[#e8e8ff] via-[#f0e8ff] to-[#e8f0ff] p-4 gap-4">
        <Sidebar />
        <div className="flex flex-col w-full gap-3">
          <Navbar title="Dashboard" />
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#e8e8ff] via-[#f0e8ff] to-[#e8f0ff] p-4 gap-4">
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col w-full gap-3">
        {/* Header */}
        <Navbar title="Dashboard" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 bg-white rounded-[32px] p-5 h-full">
          {/* Uptime Section */}
          <div className="col-span-1 md:col-span-3 lg:col-span-6">
            <StatCardLayout
              image="/images/power.svg"
              startColor="#330867"
              endColor="#30CFD0"
              className="p-6 flex flex-row"
            >
              <div className="flex w-1/2 items-center gap-5">
                <div className="rounded-full p-2 w-32 h-32 flex items-center justify-center">
                  <img src="/images/power.svg" alt="Power" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-5xl text-white font-base leading-none">
                    {stats?.systemUptime || "00:00:00"}
                  </div>
                  <div className="text-3xl text-white font-base">Uptime</div>
                </div>
              </div>
              <div className="flex w-1/2 gap-5 items-center justify-between">
                <div className="text-center flex flex-col gap-1">
                  <div className="text-3xl font-base leading-none">
                    {stats?.activeBotsUptime || "00:00:00"}
                  </div>
                  <div className="text-base font-medium">
                    Active Bots
                    <br />
                    Uptime
                  </div>
                </div>
                {/* Separator */}
                <div className="h-16 w-px bg-gray-300 relative"></div>
                <div className="text-center flex flex-col gap-1">
                  <div className="text-3xl font-base leading-none">
                    {stats?.dexBotsUptime || "00:00:00"}
                  </div>
                  <div className="text-base font-medium">
                    DEX Bots
                    <br />
                    Uptime
                  </div>
                </div>
                {/* Separator */}
                <div className="h-16 w-px bg-gray-300 relative"></div>
                <div className="text-center flex flex-col gap-1">
                  <div className="text-3xl font-base leading-none">
                    {stats?.cexBotsUptime || "00:00:00"}
                  </div>
                  <div className="text-base font-medium">
                    CEX Bots
                    <br />
                    Uptime
                  </div>
                </div>
              </div>
            </StatCardLayout>
          </div>
          {/* Stats Grid */}
      {statsCards.map((card, index) => (
            <StatCardLayout
              key={index}
              image={card.image}
              startColor={card.startColor}
              endColor={card.endColor}
        className="flex flex-col items-center my-4 gap-1 py-3"
            >
        <div className="bg-white rounded-full p-2 w-[56px] h-[56px] flex items-center justify-center">
                <img src={card.image} alt={card.title} />
              </div>
        <div className="text-3xl text-white font-base">{card.value}</div>
        <div className="text-xl text-white font-base text-center">{card.title}</div>
            </StatCardLayout>
          ))}

          {/* Exchange Stats Grid */}
      {exchangeCards.map((card, index) => (
            <StatCardLayout
              key={index}
              image={card.image}
              startColor={card.startColor}
              endColor={card.endColor}
        className="flex flex-col items-center my-4 gap-1 py-3"
            >
        <div className="bg-white rounded-full p-2 w-[56px] h-[56px] flex items-center justify-center">
                <img src={card.image} alt={card.title} />
              </div>
        <div className="text-3xl text-white font-base">{card.value}</div>
        <div className="text-xl text-white font-base text-center">{card.title}</div>
            </StatCardLayout>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
