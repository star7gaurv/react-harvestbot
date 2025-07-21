import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { UserProvider, useUser } from "./contexts/UserContext";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateBot from "./pages/CreateBot";
import AllBots from "./pages/AllBots";
import SavedMemories from "./pages/SavedMemories";

function AppRoutes() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-[#e8e8ff] via-[#f0e8ff] to-[#e8f0ff] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/dashboard" replace /> : <Signup />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/create-bot"
          element={user ? <CreateBot /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/all-bots"
          element={user ? <AllBots /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/memories"
          element={user ? <SavedMemories /> : <Navigate to="/login" replace />}
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <UserProvider>
      <AppRoutes />
      <Toaster />
    </UserProvider>
  );
}

export default App;
