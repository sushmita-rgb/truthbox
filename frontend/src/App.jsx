import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import FeedbackPage from "./pages/FeedbackPage";
import PageTransition from "./components/PageTransition";
import CloudCanvas from "./components/CloudCanvas";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"               element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login"          element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup"         element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/dashboard"      element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/feedback/:linkId" element={<PageTransition><FeedbackPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function AppShell() {
  return (
    <>
      {/* Global cloud canvas — visible on every page */}
      <CloudCanvas />

      {/* Subtle dark vignette overlay so clouds don't compete with text */}
      <div className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(151,206,35,0.04) 0%, transparent 55%), " +
            "linear-gradient(180deg, rgba(5,5,5,0.10) 0%, rgba(5,5,5,0.25) 100%)",
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
