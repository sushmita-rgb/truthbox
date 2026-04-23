import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import FeedbackPage from "./pages/FeedbackPage";
import PageTransition from "./components/PageTransition";
import BubbleCanvas from "./components/BubbleCanvas";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"              element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login"         element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup"        element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/dashboard"     element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/feedback/:linkId" element={<PageTransition><FeedbackPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      {/* BubbleCanvas sits behind everything, on every page */}
      <BubbleCanvas />
      <div className="relative z-10 min-h-screen text-white font-sans selection:bg-accent/30 bg-main/90">
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

export default App;
