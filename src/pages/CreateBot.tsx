import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CheckSquare,
  Download,
  Save,
  Upload,
  XSquare,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { useBots, CreateBotData } from "../hooks/useBots";
import { useMemories } from "../hooks/useMemories";
import { useUser } from "../contexts/UserContext";
import toast from "react-hot-toast";

const CreateBot: React.FC = () => {
  // Mobile sidebar toggle must be the first hook
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { createBot, bots, error: botError } = useBots();
  const { createMemory, memories, fetchMemories, loadMemory } = useMemories();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [selectedCEX, setSelectedCEX] = useState("");
  const [selectedExchangeType, setSelectedExchangeType] = useState("");
  const [isStartingBot, setIsStartingBot] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);

  // Token input state for symbol
  const [token1, setToken1] = useState("");
  const [token2, setToken2] = useState("");

  // Form state for bot configuration
  const [botConfig, setBotConfig] = useState<CreateBotData>({
    name: "",
    symbol: "",
    network: "",
    exchangeType: "CEX",
    minTime: 3,
    maxTime: 9,
    minSpread: 0.001,
    maxSpread: 1000000,
    buyRatio: 0.5,
    walletPercentage: 20,
    pauseVolume: 10000000,
    exchangeTypeValue: "MM to MM",
    apiKey1: "",
    apiSecret1: "",
    apiKey2: "",
    apiSecret2: "",
  });

  // Load memory data if navigating from memories page
  useEffect(() => {
    if (location.state?.memoryData) {
      const memoryData = location.state.memoryData;

      // Parse symbol to extract tokens
      const symbolParts = memoryData.symbol.split("_");
      const token1Value = symbolParts[0] || "";
      const token2Value = symbolParts[1] || "";

      setBotConfig((prev) => ({
        ...prev,
        name: memoryData.name,
        exchangeType: memoryData.exchangeType,
        network: memoryData.network,
        symbol: memoryData.symbol,
        buyRatio: memoryData.buyRatio,
        minSpread: memoryData.minSpread,
        maxSpread: memoryData.maxSpread,
        minTime: memoryData.minTime,
        maxTime: memoryData.maxTime,
        walletPercentage: memoryData.walletPercentage,
        pauseVolume: memoryData.pauseVolume,
        exchangeTypeValue: memoryData.exchangeTypeValue,
      }));

      // Set selections based on memory data
      setSelectedExchangeType(
        memoryData.exchangeType === "CEX"
          ? "Centralized (CEX)"
          : "Decentralized (DEX)"
      );
      setSelectedCEX(memoryData.network);
      setSelectedSymbol(memoryData.symbol);
      setToken1(token1Value);
      setToken2(token2Value);

      // Jump to step 4 if memory data is loaded
      setCurrentStep(4);
    }
  }, [location.state]);

  // Show error notification when botError changes
  useEffect(() => {
    if (botError) {
      setShowError(true);
      // Auto-hide error after 5 seconds
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [botError]);

  // Fetch memories on component mount
  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const cexs = [
    {
      name: "KuCoin",
      selected: true,
      image: "/images/kucoin.svg",
    },
    {
      name: "Binance",
      selected: false,
      image: "/images/binance.svg",
    },
    {
      name: "LBank",
      selected: false,
      image: "/images/lbank.svg",
    },
    { name: "OKX", selected: false, image: "/images/okx.svg" },
    {
      name: "ByBit",
      selected: false,
      image: "/images/bybit.svg",
    },
  ];

  const exchangeTypes = [
    {
      name: "Centralized (CEX)",
      image: "/images/cex-1.svg",
      selected: false,
    },
    {
      name: "Decentralized (DEX)",
      image: "/images/dex-1.svg",
      selected: false,
    },
  ];

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTokenInput = (tokenNumber: 1 | 2, value: string) => {
    if (tokenNumber === 1) {
      setToken1(value.toUpperCase());
    } else {
      setToken2(value.toUpperCase());
    }

    // Update symbol when both tokens are entered
    if (tokenNumber === 1 && token2) {
      const symbol = `${value.toUpperCase()}_${token2}`;
      setSelectedSymbol(symbol);
      setBotConfig((prev) => ({ ...prev, symbol: symbol }));
    } else if (tokenNumber === 2 && token1) {
      const symbol = `${token1}_${value.toUpperCase()}`;
      setSelectedSymbol(symbol);
      setBotConfig((prev) => ({ ...prev, symbol: symbol }));
    }
  };

  const handleCEXSelect = (cex: string) => {
    setSelectedCEX(cex);
    setBotConfig((prev) => ({ ...prev, network: cex }));
  };

  const handleExchangeTypeSelect = (exchangeType: string) => {
    setSelectedExchangeType(exchangeType);
    setBotConfig((prev) => ({
      ...prev,
      exchangeType: exchangeType === "Centralized (CEX)" ? "CEX" : "DEX",
    }));
  };

  const handleStartBot = async () => {
    try {
      // Clear any existing errors and success messages
      setShowError(false);
      setShowSuccess(false);

      // Validate required fields
      if (!botConfig.name || !botConfig.symbol || !botConfig.network) {
        alert(
          "Please fill in all required fields: Bot name, Symbol, and Network"
        );
        return;
      }

      // Check if API credentials are provided for production mode
      const hasApiCredentials =
        botConfig.apiKey1 &&
        botConfig.apiSecret1 &&
        botConfig.apiKey2 &&
        botConfig.apiSecret2;

      if (!hasApiCredentials) {
        const proceedWithoutCredentials = window.confirm(
          "No API credentials provided. This will create a demo bot that won't actually trade. Do you want to proceed?"
        );
        if (!proceedWithoutCredentials) {
          return;
        }
      }

      // Show loading message
      const loadingMessage = hasApiCredentials
        ? "Creating and starting bot..."
        : "Creating demo bot...";
      console.log(loadingMessage);

      setIsStartingBot(true);
      const newBot = await createBot(botConfig);

      if (newBot) {
        // Bot was created and started successfully
        const message = hasApiCredentials
          ? "Bot created and started successfully! 🚀"
          : "Demo bot created successfully! (No API credentials provided)";

        setSuccessMessage(message);
        setShowSuccess(true);

        // Navigate to all bots page after successful creation
        setTimeout(() => {
          navigate("/all-bots");
        }, 2000);
      } else if (hasApiCredentials) {
        // Bot was created but failed to start (only show this for bots with API credentials)
        const errorMessage =
          "Bot created but failed to start. Please check your API credentials and try starting manually.";
        alert(errorMessage);

        // Navigate to all bots page to see the created bot
        navigate("/all-bots");
      } else {
        // Demo bot created successfully (no API credentials)
        setSuccessMessage(
          "Demo bot created successfully! (No API credentials provided)"
        );
        setShowSuccess(true);

        setTimeout(() => {
          navigate("/all-bots");
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to create bot:", error);

      // Provide more specific error messages
      let errorMessage =
        "Failed to create bot. Please check your configuration and try again.";

      if (error instanceof Error) {
        if (error.message.includes("401")) {
          errorMessage = "Authentication failed. Please log in again.";
        } else if (error.message.includes("500")) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your connection.";
        }
      }

      alert(errorMessage);
    } finally {
      setIsStartingBot(false);
    }
  };

  const handleImportMemory = async (memoryId: string) => {
    try {
      const memory = await loadMemory(memoryId);
      if (memory) {
        // Parse symbol to extract tokens
        const symbolParts = memory.symbol.split("_");
        const token1Value = symbolParts[0] || "";
        const token2Value = symbolParts[1] || "";

        setBotConfig({
          name: memory.name,
          symbol: memory.symbol,
          network: memory.network,
          exchangeType: memory.exchangeType,
          minTime: memory.minTime,
          maxTime: memory.maxTime,
          minSpread: memory.minSpread,
          maxSpread: memory.maxSpread,
          buyRatio: memory.buyRatio,
          walletPercentage: memory.walletPercentage,
          pauseVolume: memory.pauseVolume,
          exchangeTypeValue: memory.exchangeTypeValue || "MM to MM",
          // Clear API keys for security
          apiKey1: "",
          apiSecret1: "",
          apiKey2: "",
          apiSecret2: "",
        });

        // Set selections based on memory data
        setSelectedExchangeType(
          memory.exchangeType === "CEX"
            ? "Centralized (CEX)"
            : "Decentralized (DEX)"
        );
        setSelectedCEX(memory.network);
        setSelectedSymbol(memory.symbol);
        setToken1(token1Value);
        setToken2(token2Value);

        // Close modal and show success
        setShowImportModal(false);
        setSuccessMessage(
          `Configuration "${memory.name}" loaded successfully! 📥`
        );
        setShowSuccess(true);

        // Jump to step 4
        setCurrentStep(4);

        toast.success(`Configuration "${memory.name}" loaded successfully!`);
      }
    } catch (error) {
      console.error("Failed to import memory:", error);
      toast.error("Failed to load configuration");
    }
  };

  const handleSaveConfiguration = async () => {
    try {
      // Clear any existing notifications
      setShowError(false);
      setShowSuccess(false);

      // Validate required fields for memory
      if (!botConfig.name || !botConfig.symbol || !botConfig.network) {
        alert(
          "Please fill in the bot name, symbol, and network before saving as memory."
        );
        return;
      }

      // Save as memory
      await createMemory({
        name: botConfig.name,
        exchangeType: botConfig.exchangeType,
        network: botConfig.network,
        symbol: botConfig.symbol,
        minTime: botConfig.minTime,
        maxTime: botConfig.maxTime,
        minSpread: botConfig.minSpread,
        maxSpread: botConfig.maxSpread,
        buyRatio: botConfig.buyRatio,
        walletPercentage: botConfig.walletPercentage,
        pauseVolume: botConfig.pauseVolume,
        exchangeTypeValue: botConfig.exchangeTypeValue,
      });

      setSuccessMessage("Configuration saved as memory successfully! 💾");
      setShowSuccess(true);
    } catch (error) {
      console.error("Failed to save configuration:", error);

      let errorMessage = "Failed to save configuration";
      if (error instanceof Error) {
        if (error.message.includes("401")) {
          errorMessage = "Authentication failed. Please log in again.";
        } else if (error.message.includes("500")) {
          errorMessage = "Server error. Please try again later.";
        }
      }

      alert(errorMessage);
    }
  };

  const handleDiscardValues = () => {
    if (window.confirm("Are you sure you want to discard all values?")) {
      setBotConfig({
        name: "",
        symbol: "",
        network: "",
        exchangeType: "CEX",
        minTime: 3,
        maxTime: 9,
        minSpread: 0.001,
        maxSpread: 1000000,
        buyRatio: 0.5,
        walletPercentage: 20,
        pauseVolume: 10000000,
        exchangeTypeValue: "MM to MM",
        apiKey1: "",
        apiSecret1: "",
        apiKey2: "",
        apiSecret2: "",
      });
      setSelectedSymbol("");
      setSelectedCEX("");
      setSelectedExchangeType("");
      setToken1("");
      setToken2("");
      setCurrentStep(1);
    }
  };

  const handleImportKeysClick = () => {
    // Create a hidden file input and trigger it
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.style.display = "none";
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      if (file.type !== "application/json") {
        toast.error("Please select a valid JSON file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const keysData = JSON.parse(content);

          // Validate the structure
          if (
            !keysData.apiKey1 ||
            !keysData.apiSecret1 ||
            !keysData.apiKey2 ||
            !keysData.apiSecret2
          ) {
            toast.error(
              "Invalid keys file format. Please ensure all required keys are present."
            );
            return;
          }

          // Update the bot config with imported keys
          setBotConfig((prev) => ({
            ...prev,
            apiKey1: keysData.apiKey1,
            apiSecret1: keysData.apiSecret1,
            apiKey2: keysData.apiKey2,
            apiSecret2: keysData.apiSecret2,
          }));

          setSuccessMessage("API keys imported successfully! 🔑");
          setShowSuccess(true);
          toast.success("API keys imported successfully!");
        } catch (error) {
          console.error("Failed to parse keys file:", error);
          toast.error(
            "Failed to parse keys file. Please check the file format."
          );
        }
      };

      reader.readAsText(file);
      target.value = "";
    };
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  const handleExportKeys = () => {
    const keysData = {
      apiKey1: botConfig.apiKey1,
      apiSecret1: botConfig.apiSecret1,
      apiKey2: botConfig.apiKey2,
      apiSecret2: botConfig.apiSecret2,
    };

    const dataStr = JSON.stringify(keysData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `api-keys-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast.success("API keys exported successfully!");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#e8e8ff] via-[#f0e8ff] to-[#e8f0ff] p-3 sm:p-4 gap-3 sm:gap-4">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Error Notification */}
      {showError && botError && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <XSquare size={20} className="mr-2" />
              <span className="font-medium">Error</span>
            </div>
            <button
              onClick={() => setShowError(false)}
              className="text-red-500 hover:text-red-700"
            >
              <XSquare size={16} />
            </button>
          </div>
          <p className="mt-1 text-sm">{botError}</p>
        </div>
      )}

      {/* Success Notification */}
      {showSuccess && successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckSquare size={20} className="mr-2" />
              <span className="font-medium">Success</span>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-green-500 hover:text-green-700"
            >
              <XSquare size={16} />
            </button>
          </div>
          <p className="mt-1 text-sm">{successMessage}</p>
        </div>
      )}

      {/* Main Content */}
  <div className="flex flex-col w-full gap-3 sm:gap-4">
        {currentStep === 1 ? (
          <>
    <Navbar title="Start a Bot" onMenuClick={() => setMenuOpen(true)} />

            {/* Create Bot Content */}
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 h-full">
              <div className="flex flex-col bg-white rounded-[24px] md:rounded-[32px] w-full lg:w-3/4 h-full p-4 md:p-5">
                <div className="flex flex-col items-center justify-between h-full">
                  <div className="text-center mt-10">
                    <h2 className="text-5xl font-bold text-black mb-4">
                      Welcome
                    </h2>
                    <p className="text-black text-base max-w-md text-center">
                      Please complete these three initial setup steps to proceed
                      to the detailed configuration of your trading bot
                    </p>
                  </div>

                  <div className="flex flex-col gap-8">
                    <div className="flex flex-row gap-8">
                      {exchangeTypes.map((exchangeType, index) => (
                        <div
                          key={index}
                          className={`flex flex-col items-center gap-4 hover:bg-black hover:text-white cursor-pointer rounded-2xl p-5 w-[150px] h-[150px] ${
                            selectedExchangeType === exchangeType.name
                              ? "bg-black text-white"
                              : "bg-white"
                          }`}
                          onClick={() =>
                            handleExchangeTypeSelect(exchangeType.name)
                          }
                        >
                          <img
                            src={exchangeType.image}
                            alt={exchangeType.name}
                            className="w-20 h-20"
                          />
                          <span className="font-medium text-xs text-center">
                            {exchangeType.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="text-black text-base text-center">
                      Select your exchange preference
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full">
                    <button
                      className="flex items-center gap-2 px-4 py-2 text-white"
                      onClick={handlePrevStep}
                      disabled={true}
                    ></button>

                    <div className="flex gap-2">
                      {[1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            step === currentStep ? "bg-blue-600" : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-[#2764e7] text-white rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleNextStep}
                      disabled={!selectedExchangeType}
                    >
                      Next Step
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Step Navigation */}
              </div>

              {/* Created Bots Sidebar */}
              <div className="w-full lg:w-1/4 bg-white rounded-[24px] md:rounded-[32px] px-8 md:px-16 overflow-y-auto h-full gap-3">
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <img
                    src="/images/any-bots.svg"
                    alt="any bot"
                    className="w-12 h-12"
                  />
                  <p>Any bot created in this session will appear here</p>
                </div>
              </div>
            </div>
          </>
        ) : currentStep === 2 ? (
          <>
            <Navbar title="Start a Bot" subTitle="CEX" onMenuClick={() => setMenuOpen(true)} />

            {/* Create Bot Content */}
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 h-full">
              <div className="flex flex-col bg-white rounded-[24px] md:rounded-[32px] w-full lg:w-3/4 h-full p-4 md:p-5">
                <div className="flex flex-col items-center justify-between h-full">
                  <div className="text-center mt-10">
                    <h2 className="text-5xl font-bold text-black mb-4">
                      Welcome
                    </h2>
                    <p className="text-black text-base max-w-md text-center">
                      Please complete these three initial setup steps to proceed
                      to the detailed configuration of your trading bot
                    </p>
                  </div>

                  <div className="flex flex-col gap-8">
                    <div className="flex flex-row gap-8">
                      {cexs.map((cex, index) => (
                        <div
                          key={index}
                          className={`flex flex-col items-center gap-4 hover:border-1 hover:border-blue-500 cursor-pointer rounded-2xl py-3 w-[120px] h-[120px] ${
                            selectedCEX === cex.name
                              ? "border-2 border-blue-500"
                              : "bg-white"
                          }`}
                          onClick={() => handleCEXSelect(cex.name)}
                        >
                          <img
                            src={cex.image}
                            alt={cex.name}
                            className="w-16"
                          />
                          <span className="font-medium text-xs text-center">
                            {cex.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="text-black text-base text-center">
                      Select your CEX preference
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full">
                    <button
                      className="flex items-center gap-2 px-4 py-2 text-[#2764e7] bg-white hover:bg-[#2764e7] hover:text-white border border-[#2764e7] rounded-2xl"
                      onClick={handlePrevStep}
                    >
                      <ArrowLeft size={16} />
                      Prev Step
                    </button>

                    <div className="flex gap-2">
                      {[1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            step === currentStep ? "bg-blue-600" : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-[#2764e7] text-white rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleNextStep}
                      disabled={!selectedCEX}
                    >
                      Next Step
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Created Bots Sidebar */}
              <div className="w-full lg:w-1/4 bg-white rounded-[24px] md:rounded-[32px] px-8 md:px-16 overflow-y-auto h-full gap-3">
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <img
                    src="/images/any-bots.svg"
                    alt="any bot"
                    className="w-12 h-12"
                  />
                  <p>Any bot created in this session will appear here</p>
                </div>
              </div>
            </div>
          </>
        ) : currentStep === 3 ? (
          <>
            <Navbar
              title="Start a Bot"
              subTitle={`${botConfig.exchangeType} >> ${botConfig.network}`}
              onMenuClick={() => setMenuOpen(true)}
            />

            {/* Create Bot Content */}
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 h-full">
              <div className="flex flex-col bg-white rounded-[24px] md:rounded-[32px] w-full lg:w-3/4 h-full p-4 md:p-5">
                <div className="flex flex-col items-center justify-between h-full">
                  <div className="text-center mt-10">
                    <h2 className="text-5xl font-bold text-black mb-4">
                      Welcome
                    </h2>
                    <p className="text-black text-base max-w-md text-center">
                      Please complete these three initial setup steps to proceed
                      to the detailed configuration of your trading bot
                    </p>
                  </div>

                  <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-6 w-full max-w-md">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-black mb-2">
                          Enter Trading Pair
                        </h3>
                        <p className="text-sm text-gray-600">
                          Enter the two tokens you want to trade
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label
                            htmlFor="token1"
                            className="block text-sm font-medium text-black mb-2"
                          >
                            First Token
                          </label>
                          <input
                            id="token1"
                            type="text"
                            placeholder="e.g., BTC"
                            value={token1}
                            onChange={(e) =>
                              handleTokenInput(1, e.target.value)
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg hover:border-blue-500 focus:border-blue-500 focus:outline-none text-center font-medium"
                            maxLength={10}
                          />
                        </div>

                        <div className="flex items-center justify-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm">
                              /
                            </span>
                          </div>
                        </div>

                        <div className="flex-1">
                          <label
                            htmlFor="token2"
                            className="block text-sm font-medium text-black mb-2"
                          >
                            Second Token
                          </label>
                          <input
                            id="token2"
                            type="text"
                            placeholder="e.g., USDT"
                            value={token2}
                            onChange={(e) =>
                              handleTokenInput(2, e.target.value)
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg hover:border-blue-500 focus:border-blue-500 focus:outline-none text-center font-medium"
                            maxLength={10}
                          />
                        </div>
                      </div>

                      {selectedSymbol && (
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-gray-600 mb-1">
                            Selected Trading Pair:
                          </p>
                          <p className="text-lg font-bold text-blue-700">
                            {token1}/{token2}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            ({selectedSymbol})
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="text-black text-base text-center">
                      Enter your trading pair tokens
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full">
                    <button
                      className="flex items-center gap-2 px-4 py-2 text-[#2764e7] bg-white hover:bg-[#2764e7] hover:text-white border border-[#2764e7] rounded-2xl"
                      onClick={handlePrevStep}
                    >
                      <ArrowLeft size={16} />
                      Prev Step
                    </button>

                    <div className="flex gap-2">
                      {[1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            step === currentStep ? "bg-blue-600" : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-[#2764e7] text-white rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleNextStep}
                      disabled={!token1 || !token2}
                    >
                      Confirm
                      <Check size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Created Bots Sidebar */}
              <div className="w-full lg:w-1/4 bg-white rounded-[24px] md:rounded-[32px] px-8 md:px-16 overflow-y-auto h-full gap-3">
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <img
                    src="/images/any-bots.svg"
                    alt="any bot"
                    className="w-12 h-12"
                  />
                  <p>Any bot created in this session will appear here</p>
                </div>
              </div>
            </div>
          </>
        ) : currentStep === 4 ? (
          <>
            <Navbar
              title="Start a Bot"
              subTitle={`${botConfig.exchangeType} >> ${botConfig.network} >> ${botConfig.symbol}`}
              onMenuClick={() => setMenuOpen(true)}
            />

            {/* Create Bot Content */}
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 h-full">
              <div className="flex flex-col items-center justify-between bg-white rounded-[24px] md:rounded-[32px] w-full lg:w-3/4 h-full p-4 md:p-5">
                  <div className="flex flex-col lg:flex-row w-full gap-6">
                  <div className="flex flex-col flex-1 gap-5 justify-between">
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="name"
                        className="block text-sm font-base text-black"
                      >
                        Name of the bot:
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Name"
                        value={botConfig.name}
                        onChange={(e) =>
                          setBotConfig({
                            ...botConfig,
                            name: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg hover:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="flex flex-col gap-1">
                        <label
                          htmlFor="minTime"
                          className="block text-sm font-base text-black"
                        >
                          Min. Time:
                        </label>
                        <div className="flex">
                          <input
                            id="minTime"
                            type="number"
                            value={botConfig.minTime}
                            onChange={(e) =>
                              setBotConfig({
                                ...botConfig,
                                minTime: parseInt(e.target.value),
                              })
                            }
                            className="w-3/5 p-2 border border-gray-300 rounded-l-lg hover:border-blue-500 focus:border-blue-500"
                          />
                          <select className="w-2/5 p-2 border border-l-0 border-gray-300 rounded-r-lg hover:border-blue-500 focus:border-blue-500">
                            <option>secs</option>
                            <option>mins</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label
                          htmlFor="maxTime"
                          className="block text-sm font-base text-black"
                        >
                          Max. Time:
                        </label>
                        <div className="flex">
                          <input
                            id="maxTime"
                            type="number"
                            value={botConfig.maxTime}
                            onChange={(e) =>
                              setBotConfig({
                                ...botConfig,
                                maxTime: parseInt(e.target.value),
                              })
                            }
                            className="w-3/5 p-2 border border-gray-300 rounded-l-lg hover:border-blue-500 focus:border-blue-500"
                          />
                          <select className="w-2/5 p-2 border border-l-0 border-gray-300 rounded-r-lg hover:border-blue-500 focus:border-blue-500">
                            <option>secs</option>
                            <option>mins</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="flex flex-col gap-1">
                        <label
                          htmlFor="minSpread"
                          className="block text-sm font-base text-black"
                        >
                          Min. Spread:
                        </label>
                        <input
                          id="minSpread"
                          type="number"
                          step="0.01"
                          value={botConfig.minSpread}
                          onChange={(e) =>
                            setBotConfig({
                              ...botConfig,
                              minSpread: parseFloat(e.target.value),
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg hover:border-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label
                          htmlFor="maxSpread"
                          className="block text-sm font-base text-black"
                        >
                          Max. Spread:
                        </label>
                        <input
                          id="maxSpread"
                          type="number"
                          step="0.01"
                          value={botConfig.maxSpread}
                          onChange={(e) =>
                            setBotConfig({
                              ...botConfig,
                              maxSpread: parseFloat(e.target.value),
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg hover:border-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="buyRatio"
                        className="block text-sm font-base text-black"
                      >
                        Select Buy/Sell ratio:
                      </label>
                      <div className="space-y-2">
                        <input
                          id="buyRatio"
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={botConfig.buyRatio}
                          onChange={(e) =>
                            setBotConfig({
                              ...botConfig,
                              buyRatio: parseFloat(e.target.value),
                            })
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          style={
                            {
                              "--value": botConfig.buyRatio,
                              "--max": 1,
                            } as React.CSSProperties
                          }
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>0</span>
                          <span className="font-medium">
                            {botConfig.buyRatio}
                          </span>
                          <span>1</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="walletPercentage"
                        className="block text-sm font-base text-black"
                      >
                        Select wallet percentage:
                      </label>
                      <div className="space-y-2">
                        <input
                          id="walletPercentage"
                          type="range"
                          min="0"
                          max="100"
                          value={botConfig.walletPercentage}
                          onChange={(e) =>
                            setBotConfig({
                              ...botConfig,
                              walletPercentage: parseInt(e.target.value),
                            })
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          style={
                            {
                              "--value": botConfig.walletPercentage,
                              "--max": 100,
                            } as React.CSSProperties
                          }
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>0%</span>
                          <span className="font-medium">
                            {botConfig.walletPercentage}%
                          </span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="pauseVolume"
                        className="block text-sm font-base text-black"
                      >
                        Pause Volume:
                      </label>
                      <input
                        id="pauseVolume"
                        type="number"
                        value={botConfig.pauseVolume}
                        onChange={(e) =>
                          setBotConfig({
                            ...botConfig,
                            pauseVolume: parseInt(e.target.value),
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg hover:border-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="exchangeType"
                        className="block text-sm font-base text-black"
                      >
                        Enter exchange type:
                      </label>
                      <div className="flex flex-col gap-2 mt-1">
                        <div className="flex items-center gap-4">
                          <input
                            type="radio"
                            id="mm-to-user"
                            name="exchangeType"
                            value="MM to User"
                            checked={
                              botConfig.exchangeTypeValue === "MM to User"
                            }
                            onChange={() =>
                              setBotConfig({
                                ...botConfig,
                                exchangeTypeValue: "MM to User",
                              })
                            }
                            className="form-radio h-4 w-4 text-black"
                          />
                          <label
                            htmlFor="mm-to-user"
                            className="text-sm text-black mr-2"
                          >
                            MM to User
                          </label>
                          <input
                            type="text"
                            placeholder="Enter Value (in %)"
                            value={
                              botConfig.exchangeTypeValue === "MM to User"
                                ? botConfig.exchangeTypeValue
                                : ""
                            }
                            onChange={(e) =>
                              setBotConfig({
                                ...botConfig,
                                exchangeTypeValue: e.target.value,
                              })
                            }
                            className={`p-1 border border-gray-300 rounded-lg hover:border-blue-500 focus:border-blue-500 transition-all w-48 ${
                              botConfig.exchangeTypeValue !== "MM to User"
                                ? "bg-gray-100 text-gray-400"
                                : ""
                            }`}
                            disabled={
                              botConfig.exchangeTypeValue !== "MM to User"
                            }
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <input
                            type="radio"
                            id="mm-to-mm"
                            name="exchangeType"
                            value="MM to MM"
                            checked={botConfig.exchangeTypeValue === "MM to MM"}
                            onChange={() =>
                              setBotConfig({
                                ...botConfig,
                                exchangeTypeValue: "MM to MM",
                              })
                            }
                            className="form-radio h-4 w-4 text-black"
                          />
                          <label
                            htmlFor="mm-to-mm"
                            className="text-sm text-black"
                          >
                            MM to MM
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                    <div className="flex flex-col flex-1 lg:pl-8 gap-5">
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="apiKey1"
                        className="block text-sm font-base text-black"
                      >
                        API Key Account 1:
                      </label>
                      <input
                        id="apiKey1"
                        type="text"
                        placeholder="Key here..."
                        value={botConfig.apiKey1}
                        onChange={(e) =>
                          setBotConfig({
                            ...botConfig,
                            apiKey1: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg hover:border-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="apiSecret1"
                        className="block text-sm font-base text-black"
                      >
                        API Secret Account 1:
                      </label>
                      <input
                        id="apiSecret1"
                        type="password"
                        placeholder="Secret here..."
                        value={botConfig.apiSecret1}
                        onChange={(e) =>
                          setBotConfig({
                            ...botConfig,
                            apiSecret1: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg hover:border-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="apiKey2"
                        className="block text-sm font-base text-black"
                      >
                        API Key Account 2:
                      </label>
                      <input
                        id="apiKey2"
                        type="text"
                        placeholder="Key here..."
                        value={botConfig.apiKey2}
                        onChange={(e) =>
                          setBotConfig({
                            ...botConfig,
                            apiKey2: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg hover:border-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="apiSecret2"
                        className="block text-sm font-base text-black"
                      >
                        API Secret Account 2:
                      </label>
                      <input
                        id="apiSecret2"
                        type="password"
                        placeholder="Secret here..."
                        value={botConfig.apiSecret2}
                        onChange={(e) =>
                          setBotConfig({
                            ...botConfig,
                            apiSecret2: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg hover:border-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <button
                      onClick={handleImportKeysClick}
                      className="flex items-center justify-center place-self-center text-sm w-1/3 gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:border-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <Download size={16} />
                      Import Keys
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap w-full gap-2 justify-end mt-4">
                  <button
                    className="flex items-center gap-2 p-2 border border-red-500 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white"
                    onClick={handleDiscardValues}
                  >
                    <XSquare size={16} />
                    Discard Values
                  </button>
                  <button
                    className="flex items-center gap-2 p-2 border border-blue-500 text-blue-500 rounded-2xl hover:bg-blue-600 hover:text-white transition-colors"
                    onClick={() => setShowImportModal(true)}
                  >
                    <Upload size={16} />
                    Import Memory
                  </button>
                  <button
                    className="flex items-center gap-2 p-2 border border-green-500 text-green-500 rounded-2xl hover:bg-green-600 hover:text-white transition-colors"
                    onClick={handleSaveConfiguration}
                  >
                    <Save size={16} />
                    Save Configuration
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-3 bg-[#2764e7] text-white rounded-2xl hover:bg-[#2764e7]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleStartBot}
                    disabled={
                      isStartingBot ||
                      !botConfig.name ||
                      !botConfig.symbol ||
                      !botConfig.network ||
                      !botConfig.apiKey1 ||
                      !botConfig.apiSecret1 ||
                      !botConfig.apiKey2 ||
                      !botConfig.apiSecret2
                    }
                  >
                    {isStartingBot ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Starting...
                      </>
                    ) : (
                      <>
                        <CheckSquare size={16} />
                        Start Bot
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Created Bots Sidebar */}
              <div className="w-full lg:w-1/4 bg-white rounded-[24px] md:rounded-[32px] px-8 md:px-16 overflow-y-auto h-full gap-3">
                {bots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <img
                      src="/images/any-bots.svg"
                      alt="any bot"
                      className="w-12 h-12"
                    />
                    <p>Any bot created in this session will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bots.map((bot) => (
                      <div
                        key={bot.id}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Bot size={20} className="text-blue-600" />
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-800">
                              {bot.name}
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex justify-between">
                                <span>Exchange</span>
                                <span>{bot.network}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Trade Pair</span>
                                <span>{bot.symbol}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Status</span>
                                <span
                                  className={`font-medium ${
                                    bot.status === "active"
                                      ? "text-green-600"
                                      : bot.status === "paused"
                                      ? "text-orange-600"
                                      : bot.status === "error"
                                      ? "text-red-600"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {bot.status === "active"
                                    ? "Running"
                                    : bot.status === "paused"
                                    ? "Paused"
                                    : bot.status === "error"
                                    ? "Error"
                                    : "Stopped"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Uptime</span>
                                <span className="font-medium">
                                  {bot.uptime || "00:00:00"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Started</span>
                                <span>
                                  {bot.startedAt
                                    ? new Date(
                                        bot.startedAt
                                      ).toLocaleTimeString()
                                    : new Date(
                                        bot.createdAt
                                      ).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <Navbar title="Start a Bot" />

            {/* Create Bot Content */}
            <div className="flex gap-6 h-[calc(100vh-200px)]">
              {/* Created Bots Sidebar */}
              <div className="w-80 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/20 p-6 overflow-y-auto">
                {bots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <Bot size={32} className="mb-4" />
                    <p>Any bot created in this session will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bots.map((bot) => (
                      <div
                        key={bot.id}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Bot size={20} className="text-blue-600" />
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-800">
                              {bot.name}
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex justify-between">
                                <span>Exchange</span>
                                <span>{bot.network}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Trade Pair</span>
                                <span>{bot.symbol}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Status</span>
                                <span
                                  className={`font-medium ${
                                    bot.status === "active"
                                      ? "text-green-600"
                                      : bot.status === "paused"
                                      ? "text-orange-600"
                                      : bot.status === "error"
                                      ? "text-red-600"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {bot.status === "active"
                                    ? "Running"
                                    : bot.status === "paused"
                                    ? "Paused"
                                    : bot.status === "error"
                                    ? "Error"
                                    : "Stopped"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Uptime</span>
                                <span className="font-medium">
                                  {bot.uptime || "00:00:00"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Started</span>
                                <span>
                                  {bot.startedAt
                                    ? new Date(
                                        bot.startedAt
                                      ).toLocaleTimeString()
                                    : new Date(
                                        bot.createdAt
                                      ).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Import Memory Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Import Memory Configuration
              </h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XSquare size={24} />
              </button>
            </div>

            {memories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Save size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">
                  No saved memories found
                </p>
                <p className="text-sm">
                  Save your current bot configuration to create your first
                  memory.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {memories.map((memory) => (
                  <div
                    key={memory.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800 mb-1">
                          {memory.name}
                        </h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">Exchange:</span>{" "}
                            {memory.network}
                          </div>
                          <div>
                            <span className="font-medium">Type:</span>{" "}
                            {memory.exchangeType}
                          </div>
                          <div>
                            <span className="font-medium">Trading Pair:</span>{" "}
                            {memory.symbol}
                          </div>
                          <div>
                            <span className="font-medium">Buy Ratio:</span>{" "}
                            {memory.buyRatio}
                          </div>
                          <div>
                            <span className="font-medium">Wallet %:</span>{" "}
                            {memory.walletPercentage}%
                          </div>
                          <div>
                            <span className="font-medium">Min Time:</span>{" "}
                            {memory.minTime}s
                          </div>
                          <div>
                            <span className="font-medium">Max Time:</span>{" "}
                            {memory.maxTime}s
                          </div>
                          <div>
                            <span className="font-medium">Created:</span>{" "}
                            {memory.created_at ? new Date(memory.created_at).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleImportMemory(memory.id)}
                        className="ml-4 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Import
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate("/memories")}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Manage Memories
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateBot;
