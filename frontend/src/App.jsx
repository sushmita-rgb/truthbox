import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import FeedbackPage from "./pages/FeedbackPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen text-white font-sans selection:bg-accent/30 bg-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/feedback/:linkId" element={<FeedbackPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
