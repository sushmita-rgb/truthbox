import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateIssue from "./pages/CreateIssue";
import PublicIssue from "./pages/PublicIssue";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500/30">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreateIssue />} />
          <Route path="/i/:id" element={<PublicIssue />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
