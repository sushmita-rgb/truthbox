import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import Support from "./pages/Support";
import Dashboard from "./pages/Dashboard";
import FeedbackPage from "./pages/FeedbackPage";
import WelcomeJourney from "./pages/WelcomeJourney";
import PageTransition from "./components/PageTransition";
import CloudCanvas from "./components/CloudCanvas";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserDetails from "./pages/AdminUserDetails";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"               element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login"          element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup"         element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/terms"          element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/privacy"        element={<PageTransition><Privacy /></PageTransition>} />
        <Route path="/refund"         element={<PageTransition><Refund /></PageTransition>} />
        <Route path="/support"        element={<PageTransition><Support /></PageTransition>} />
        <Route path="/dashboard"      element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/welcome"        element={<PageTransition><WelcomeJourney /></PageTransition>} />
        <Route path="/feedback/:linkId" element={<PageTransition><FeedbackPage /></PageTransition>} />
        <Route path="/admin/login"    element={<PageTransition><AdminLogin /></PageTransition>} />
        <Route path="/admin"          element={<PageTransition><AdminDashboard /></PageTransition>} />
        <Route path="/admin/users/:id" element={<PageTransition><AdminUserDetails /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

import { useState, useEffect } from "react";
import api from "./api";
import { Power } from "lucide-react";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppShell() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkSystem = async () => {
      try {
        const res = await api.get("/system/config");
        setMaintenanceMode(res.data.maintenanceMode);
      } catch (err) {
        setMaintenanceMode(false);
      }
    };
    checkSystem();
  }, []);

  const isPublicRoute = location.pathname.startsWith("/feedback/") || location.pathname.startsWith("/admin");

  if (maintenanceMode && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
        <CloudCanvas />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0" />
        <div className="relative z-10 glass p-12 rounded-3xl max-w-lg text-center border-white/10 animate-fade-in-up">
          <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Power size={32} className="text-accent" />
          </div>
          <h1 className="text-3xl font-extrabold mb-4">Under Maintenance</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Verit is currently undergoing scheduled upgrades to make the platform even better. We'll be back online shortly.
          </p>
          <p className="mt-8 text-sm text-gray-600">Your feedback links are still actively receiving responses!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      {/* Global cloud canvas — visible on every page */}
      <CloudCanvas />

      {/* Subtle dark vignette overlay so clouds don't compete with text */}
      <div className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(151,206,35,0.06) 0%, transparent 60%), " +
            "linear-gradient(180deg, rgba(5,5,5,0.20) 0%, rgba(5,5,5,0.40) 100%)",
        }}
      />

      <div className="relative z-10 min-h-screen text-white font-sans selection:bg-accent/30">
        <AnimatedRoutes />
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
