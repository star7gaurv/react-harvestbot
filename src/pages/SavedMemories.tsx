import React from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { useMemories, Memory } from "../hooks/useMemories";

const SavedMemories: React.FC = () => {
  const navigate = useNavigate();
  const { memories, loading, error, deleteMemory } = useMemories();

  const handleDeleteMemory = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this memory?")) {
      await deleteMemory(id);
    }
  };

  const handleDownloadMemory = (memory: Memory) => {
    const dataStr = JSON.stringify(memory, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${memory.name}-memory.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleEditMemory = (memory: Memory) => {
    navigate("/create-bot", {
      state: {
        memoryData: {
          name: memory.name,
          exchangeType: memory.exchangeType,
          network: memory.network,
          symbol: memory.symbol,
          minTime: memory.minTime,
          maxTime: memory.maxTime,
          minSpread: memory.minSpread,
          maxSpread: memory.maxSpread,
          buyRatio: memory.buyRatio,
          walletPercentage: memory.walletPercentage,
          pauseVolume: memory.pauseVolume,
          exchangeTypeValue: memory.exchangeTypeValue,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-[#e8e8ff] via-[#f0e8ff] to-[#e8f0ff] p-4 gap-4">
        <Sidebar />
        <div className="flex flex-col w-full gap-3">
          <Navbar title="Saved Memories" />
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading memories...</p>
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
          <Navbar title="Saved Memories" />
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

      <div className="flex flex-col w-full gap-3">
        <Navbar title="Saved Memories" />

        <div className="bg-white rounded-3xl p-6 shadow-md w-full max-w-full overflow-x-auto h-full">
          {memories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <img
                src="/images/any-bots.svg"
                alt="no memories"
                className="w-12 h-12 mb-4"
              />
              <p className="text-lg font-medium mb-2">
                No saved memories found
              </p>
              <p className="text-sm text-gray-400">
                Create a bot or save existing bot configurations as memories to
                see them here.
              </p>
              <button
                onClick={() => navigate("/create-bot")}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Bot
              </button>
            </div>
          ) : (
            <table className="min-w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-gray-500 text-sm border-b border-gray-200">
                  <th className="py-2 px-4 font-semibold">Name</th>
                  <th className="py-2 px-4 font-semibold">Exchange Type</th>
                  <th className="py-2 px-4 font-semibold">Network</th>
                  <th className="py-2 px-4 font-semibold">Trading Pair</th>
                  <th className="py-2 px-4 font-semibold">Buy/Sell Ratio</th>
                  <th className="py-2 px-4 font-semibold">Min-Max Spread</th>
                  <th className="py-2 px-4 font-semibold">Min-Max Time</th>
                  <th className="py-2 px-4 font-semibold">Pause Volume</th>
                  <th className="py-2 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {memories.map((memory) => (
                  <tr
                    key={memory.id}
                    className="hover:bg-gray-100 transition-colors rounded-xl"
                  >
                    <td className="py-2 px-4 text-gray-800 align-middle">
                      {memory.name}
                    </td>
                    <td className="py-2 px-4 text-gray-800 align-middle">
                      {memory.exchangeType}
                    </td>
                    <td className="py-2 px-4 text-gray-800 align-middle">
                      {memory.network}
                    </td>
                    <td className="py-2 px-4 text-gray-800 align-middle">
                      {memory.symbol}
                    </td>
                    <td className="py-2 px-4 text-gray-800 align-middle">
                      {memory.buyRatio}
                    </td>
                    <td className="py-2 px-4 text-gray-800 align-middle">
                      {memory.minSpread} - {memory.maxSpread}
                    </td>
                    <td className="py-2 px-4 text-gray-800 align-middle">
                      {memory.minTime} - {memory.maxTime}
                    </td>
                    <td className="py-2 px-4 text-gray-800 align-middle">
                      {memory.pauseVolume}
                    </td>
                    <td className="py-2 px-4 align-middle">
                      <div className="flex gap-2 items-center">
                        <img
                          src="/images/download.svg"
                          alt="download"
                          className="w-7 h-7 cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => handleDownloadMemory(memory)}
                        />
                        <img
                          src="/images/edit.svg"
                          alt="edit"
                          className="w-7 h-7 cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => handleEditMemory(memory)}
                        />
                        <img
                          src="/images/delete.svg"
                          alt="delete"
                          className="w-7 h-7 cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => handleDeleteMemory(memory.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedMemories;
