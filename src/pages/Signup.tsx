import { ArrowRight, Eye, EyeOff, Key, User } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import toast from "react-hot-toast";

const Signup: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { signup, error: contextError } = useUser();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!username.trim()) {
      setError("Username is required");
      toast.error("Please enter a username");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      toast.error("Username must be at least 3 characters long");
      return;
    }

    if (username.length > 20) {
      setError("Username must be less than 20 characters");
      toast.error("Username must be less than 20 characters");
      return;
    }

    // Username should only contain alphanumeric characters and underscores
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only contain letters, numbers, and underscores");
      toast.error(
        "Username can only contain letters, numbers, and underscores"
      );
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      toast.error("Please enter a password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (!confirmPassword.trim()) {
      setError("Please confirm your password");
      toast.error("Please confirm your password");
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const success = await signup(username, password);
      if (success) {
        toast.success("Account created successfully! Welcome!");
        navigate("/dashboard");
      } else {
        // Get error from context or use default message
        const errorMessage = contextError || "Signup failed. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err: any) {
      console.error("Signup error details:", err);
      
      let errorMessage = "Signup failed. Please try again.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.code === "NETWORK_ERROR") {
        errorMessage = "Network error. Please check your connection.";
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    handleSignup(e);
  };

  const handleSwitchToLogin = () => {
    navigate("/login");
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

      <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20 w-full max-w-[500px] py-10 px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-black mb-2">
            Create Account
          </h2>
          <p className="text-gray-600 text-sm">
            Sign up with your username and password
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <User size={20} />
            </div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-[#0DDFDF] rounded-xl text-base text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:shadow-md"
              disabled={isLoading}
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Key size={20} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-[#0DDFDF] rounded-xl text-base text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:shadow-md"
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent border-none text-gray-400 cursor-pointer p-1 flex items-center justify-center"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Key size={20} />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full pl-10 pr-12 py-3 border rounded-xl text-base text-gray-800 placeholder:text-gray-400 focus:shadow-md ${
                confirmPassword && password !== confirmPassword
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#0DDFDF] focus:border-blue-500"
              }`}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent border-none text-gray-400 cursor-pointer p-1 flex items-center justify-center"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Password match indicator */}
          {confirmPassword && (
            <div
              className={`text-sm ${
                password === confirmPassword ? "text-green-600" : "text-red-600"
              }`}
            >
              {password === confirmPassword
                ? "✓ Passwords match"
                : "✗ Passwords do not match"}
            </div>
          )}

          <button
            type="submit"
            disabled={
              isLoading ||
              (confirmPassword !== "" && password !== confirmPassword)
            }
            className="flex items-center justify-center gap-2 py-3 bg-[#1F7ABA] text-white border-none rounded-xl text-base hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? "Creating account..." : "Create Account"}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={handleSwitchToLogin}
              className="text-[#1F7ABA] hover:underline cursor-pointer"
            >
              Log in
            </button>
          </p>
        </div>

        <div className="text-center text-xs mt-6">
          By signing up, you agree to
          <br />
          the{" "}
          <span className="cursor-pointer text-[#1F7ABA]">
            Terms of Service
          </span>{" "}
          &{" "}
          <span className="cursor-pointer text-[#1F7ABA]">Privacy Policy</span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
