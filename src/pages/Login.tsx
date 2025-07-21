import { ArrowRight, Eye, Key, User } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import toast from "react-hot-toast";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, error: contextError } = useUser();

  const handleAccountLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Client-side validation
    if (!username.trim()) {
      setError("Username is required");
      toast.error("Please enter your username");
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      toast.error("Please enter your password");
      setIsLoading(false);
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      toast.error("Username must be at least 3 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(username, password);
      if (success) {
        toast.success("Login successful! Welcome back.");
        navigate("/dashboard");
      } else {
        const errorMessage = contextError || "Login failed";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        (err.code === "NETWORK_ERROR"
          ? "Network error. Please check your connection."
          : "Login failed. Please try again.");

      setError(errorMessage);
      toast.error(errorMessage);

      // Log error for debugging
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    handleAccountLogin(e);
  };

  const handleSwitchToSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f4ff] to-[#e0e8ff] p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/images/api-2.svg"
          className="absolute w-24 h-24 top-[7%] left-[13%] opacity-70"
          alt="api"
        />
        <img
          src="/images/wallet.svg"
          className="absolute w-24 h-24 top-[27%] left-[5%] opacity-70"
          alt="wallet"
        />
        <img
          src="/images/web3.svg"
          className="absolute w-24 h-24 top-[47%] left-[15%] opacity-70"
          alt="web3"
        />
        <img
          src="/images/chart-bar.svg"
          className="absolute w-24 h-24 top-[67%] left-[8%] opacity-70"
          alt="chart-bar"
        />
        <img
          src="/images/cross-chain.svg"
          className="absolute w-24 h-24 top-[87%] left-[20%] opacity-70"
          alt="cross-chain"
        />
        <img
          src="/images/chart-bar.svg"
          className="absolute w-24 h-24 top-[5%] right-[25%] opacity-70"
          alt="chart-bar"
        />
        <img
          src="/images/swap.svg"
          className="absolute w-24 h-24 top-[15%] right-[8%] opacity-70"
          alt="swap"
        />
        <img
          src="/images/money-bag.svg"
          className="absolute w-24 h-24 top-[35%] right-[20%] opacity-70"
          alt="money-bag"
        />
        <img
          src="/images/blockchain.svg"
          className="absolute w-24 h-24 top-[50%] right-[15%] opacity-70"
          alt="blockchain"
        />
        <img
          src="/images/api-3.svg"
          className="absolute w-24 h-24 top-[65%] right-[22%] opacity-70"
          alt="api-1"
        />
        <img
          src="/images/shield-security.svg"
          className="absolute w-24 h-24 top-[80%] right-[13%] opacity-70"
          alt="shield-security"
        />
      </div>
      <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 w-full max-w-[676px] py-10 px-8">
        <div className="flex items-stretch justify-center gap-8">
          {/* Left Side: Login Form */}
          <div className="flex-1 justify-end">
            <h2 className="text-xl font-semibold text-black text-center mb-6">
              Log In
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 p-2 border border-[#0DDFDF] rounded-xl text-base text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:shadow-md"
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Key size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 p-2 border border-[#0DDFDF] rounded-xl text-base text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:shadow-md"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 bg-transparent border-none text-gray-400 cursor-pointer p-1 flex items-center justify-center"
                  disabled={isLoading}
                >
                  <Eye size={20} />
                </button>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 py-3 bg-[#1F7ABA] text-white border-none rounded-xl text-base hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logging in..." : "Login"}
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={handleSwitchToSignup}
                  className="text-[#1F7ABA] hover:underline cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>

          {/* Separator */}
          <div className="flex items-end justify-end">
            <div className="h-32 w-px bg-gray-300 relative">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 px-2 text-sm text-gray-500 font-medium">
                or
              </span>
            </div>
          </div>

          {/* Right Side: Wallet Connect */}
          <div className="flex-1 flex flex-col items-center justify-end">
            <div className="relative w-full h-full mt-12 mb-4">
              <div className="absolute inset-0 pointer-events-none">
                <img
                  src="/images/rainbow.svg"
                  className="absolute w-10 h-10 rotate-[-20deg] top-0 left-[10%]"
                  alt="api"
                />
                <img
                  src="/images/phantom.svg"
                  className="absolute w-10 h-10 rotate-[-17deg] top-[30%] left-[30%]"
                  alt="wallet"
                />
                <img
                  src="/images/exodus.svg"
                  className="absolute w-10 h-10 top-[10%] left-[55%]"
                  alt="web3"
                />
                <img
                  src="/images/coinbase.svg"
                  className="absolute w-10 h-10 rotate-[-19deg] top-[30%] left-[75%]"
                  alt="chart-bar"
                />
                <img
                  src="/images/metamask.svg"
                  className="absolute w-10 h-10 rotate-13 top-[60%] left-[15%]"
                  alt="cross-chain"
                />
                <img
                  src="/images/binance-1.svg"
                  className="absolute w-10 h-10 rotate-[-18deg] top-[55%] left-[55%]"
                  alt="chart-bar"
                />
                <img
                  src="/images/apex.svg"
                  className="absolute w-10 h-10 rotate-25 top-[70%] left-[80%]"
                  alt="swap"
                />
              </div>
            </div>
            {/* Connect Wallet Button */}
            <button
              className="flex items-center justify-center gap-2 py-3 w-full bg-[#1F7ABA] text-white border-none rounded-xl text-base hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Connect Wallet
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <div className="text-center text-xs mt-6">
          By connecting, you agree to
          <br />
          the{" "}
          <span className="cursor-pointer text-[#1F7ABA]">
            Terms of Service
          </span>{" "}
          &{" "}
          <span className="cursor-pointer text-[#1F7ABA]">Privacy Policy</span>
        </div>
      </div>
      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
