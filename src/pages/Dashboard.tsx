import React from "react";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { StatCardLayout } from "../components/StatCardLayout";
import { useDashboard } from "../hooks/useDashboard";

const Dashboard: React.FC = () => {
  const { stats, loading, error } = useDashboard();

  const statsCards = [
    {
      title: "Total Bots",
      value: stats?.totalBots.toString() || "0",
      image: "/images/all-bots.svg",
      startColor: "#f093fb",
      endColor: "#f5576c",
    },
    {
      title: "Active Bots",
      value: stats?.activeBots.toString() || "0",
      image: "/images/active-bots.svg",
      startColor: "#30cfd0",
      endColor: "#330867",
    },
    {
      title: "Bots Paused",
      value: stats?.pausedBots.toString() || "0",
      image: "/images/paused-bots.svg",
      startColor: "#feada6",
      endColor: "#f5efef",
    },
    {
      title: "Trade Pairs",
      value: stats?.tradePairs.toString() || "0",
      image: "/images/trade-pairs.svg",
      startColor: "#88d3ce",
      endColor: "#6e45e2",
    },
  ];

  const exchangeCards = [
    {
      title: "Active CEX Bots",
      value: stats?.activeCexBots.toString() || "0",
      image: "/images/cex-bots.svg",
      startColor: "#a8edea",
      endColor: "#fed6e3",
    },
    {
      title: "Active DEX Bots",
      value: stats?.activeDexBots.toString() || "0",
      image: "/images/dex-bots.svg",
      startColor: "#d299c2",
      endColor: "#fef9d7",
    },
    {
      title: "CEX Exchanges",
      value: stats?.cexExchanges.toString() || "0",
      image: "/images/cex.svg",
      startColor: "#89f7fe",
      endColor: "#66a6ff",
    },
    {
      title: "DEX Exchanges",
      value: stats?.dexExchanges.toString() || "0",
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-white rounded-[32px] p-5 h-full">
          {/* Uptime Section */}
          <div className="col-span-4">
            <StatCardLayout
              image="/images/power.svg"
              startColor="#330867"
              endColor="#30CFD0"
              className="p-8 flex flex-row"
            >
              <div className="flex w-1/2 items-center gap-5">
                <div className="bg-white rounded-full p-2 w-32 h-32 flex items-center justify-center">
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
              className="flex flex-col items-center my-6 gap-2"
            >
              <div className="bg-white rounded-full p-2 w-[72px] h-[72px] flex items-center justify-center">
                <img src={card.image} alt={card.title} />
              </div>
              <div className="text-4xl text-white font-base">{card.value}</div>
              <div className="text-2xl text-white font-base">{card.title}</div>
            </StatCardLayout>
          ))}

          {/* Exchange Stats Grid */}
          {exchangeCards.map((card, index) => (
            <StatCardLayout
              key={index}
              image={card.image}
              startColor={card.startColor}
              endColor={card.endColor}
              className="flex flex-col items-center my-6 gap-2"
            >
              <div className="bg-white rounded-full p-2 w-[72px] h-[72px] flex items-center justify-center">
                <img src={card.image} alt={card.title} />
              </div>
              <div className="text-4xl text-white font-base">{card.value}</div>
              <div className="text-2xl text-white font-base">{card.title}</div>
            </StatCardLayout>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
