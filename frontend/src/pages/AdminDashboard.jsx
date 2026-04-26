import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Shield, Users, Link as LinkIcon, MessageSquare, Zap, Crown, TrendingUp, AlertTriangle, Globe, Trash2, Power, Bell } from "lucide-react";
import VeritLogo from "../components/VeritLogo";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [users, setUsers] = useState([]);
  const [sysConfig, setSysConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [statsRes, chartsRes, usersRes, sysRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/charts"),
        api.get("/admin/users"),
        api.get("/admin/system")
      ]);
      setStats(statsRes.data);
      setCharts(chartsRes.data);
      setUsers(usersRes.data.users);
      setSysConfig(sysRes.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const toggleMaintenance = async () => {
    if (!window.confirm(`Are you sure you want to turn ${sysConfig.maintenanceMode ? 'OFF' : 'ON'} maintenance mode?`)) return;
    try {
      await api.put("/admin/system/maintenance", { enabled: !sysConfig.maintenanceMode });
      loadData();
    } catch (err) {
      alert("Failed to toggle maintenance mode");
    }
  };

  const overridePlan = async (userId, plan) => {
    try {
      await api.put(`/admin/users/${userId}/plan`, { plan });
      loadData();
    } catch (err) {
      alert("Failed to update plan");
    }
  };

  const toggleBan = async (userId, isBanned) => {
    if (!window.confirm(`Are you sure you want to ${isBanned ? 'unban' : 'ban'} this user?`)) return;
    try {
      await api.put(`/admin/users/${userId}/ban`, { isBanned: !isBanned });
      loadData();
    } catch (err) {
      alert("Failed to toggle ban");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.prompt("Type 'DELETE' to permanently delete this user and all their data.") === "DELETE") return;
    try {
      await api.delete(`/admin/users/${userId}`);
      loadData();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading God Mode...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="text-red-500" size={24} />
              <h1 className="text-3xl font-extrabold tracking-tight">God Mode</h1>
            </div>
            <p className="text-gray-400">Verit Platform Overview</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleMaintenance}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                sysConfig?.maintenanceMode 
                  ? "bg-red-500/20 text-red-400 border-red-500/50" 
                  : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
              }`}
            >
              <Power size={16} />
              {sysConfig?.maintenanceMode ? "Maintenance: ON" : "Maintenance: OFF"}
            </button>
            <button 
              onClick={() => {
                // To logout admin, we should really have an admin logout route, but dropping the cookie via a req is best.
                // For now, let's just send them to home.
                navigate("/");
              }}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10"
            >
              Exit Admin
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total MRR" value={`₹${stats?.mrr || 0}`} icon={<TrendingUp size={20} className="text-green-400" />} />
          <StatCard title="Daily Active Users" value={stats?.dau || 0} icon={<Users size={20} className="text-blue-400" />} />
          <StatCard title="Conversion Rate" value={`${stats?.conversionRate || 0}%`} icon={<Crown size={20} className="text-yellow-400" />} />
          <StatCard title="Total Feedback" value={stats?.totalFeedback || 0} icon={<MessageSquare size={20} className="text-purple-400" />} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 glass rounded-3xl p-6 border border-white/5">
            <h3 className="text-lg font-bold mb-6">User Growth (Last 30 Days)</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts?.usersTimeline || []}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#97ce23" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#97ce23" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="_id" stroke="#333" fontSize={12} tickMargin={10} />
                  <YAxis stroke="#333" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="count" stroke="#97ce23" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Broadcast & Geo Stack */}
          <div className="space-y-6">
            {/* Broadcast Form */}
            <div className="glass rounded-3xl p-6 border border-white/5 bg-brand/5">
              <div className="flex items-center gap-2 mb-4">
                <Bell size={18} className="text-brand" />
                <h3 className="text-lg font-bold text-white">Broadcast</h3>
              </div>
              <textarea 
                placeholder="Message for all users..."
                className="w-full h-24 rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-white outline-none focus:border-brand/50 resize-none mb-3"
                id="broadcastMsg"
              />
              <div className="flex gap-2 mb-3">
                {['info', 'warning', 'success', 'brand'].map(t => (
                  <button 
                    key={t}
                    onClick={() => window.broadcastType = t}
                    className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-400 uppercase font-bold hover:border-brand/50 transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button 
                onClick={async () => {
                  const msg = document.getElementById('broadcastMsg').value;
                  if (!msg) return;
                  try {
                    await api.post('/system/broadcast', { message: msg, type: window.broadcastType || 'info' });
                    alert("Broadcast sent!");
                    document.getElementById('broadcastMsg').value = '';
                  } catch (err) {
                    alert("Failed to send broadcast");
                  }
                }}
                className="w-full py-3 rounded-xl bg-brand text-black font-bold text-sm shadow-glow"
              >
                Send to All Users
              </button>
            </div>

            {/* Top Countries Map (List) */}
            <div className="glass rounded-3xl p-6 border border-white/5">
              <div className="flex items-center gap-2 mb-6">
                <Globe size={18} className="text-blue-400" />
                <h3 className="text-lg font-bold">Top Countries</h3>
              </div>
              <div className="space-y-4">
                {charts?.geoData?.map((geo, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 font-mono text-xs">0{idx + 1}</span>
                      <span className="font-medium text-gray-200">{geo._id || "Unknown"}</span>
                    </div>
                    <span className="text-sm text-gray-400">{geo.count} responses</span>
                  </div>
                ))}
                {(!charts?.geoData || charts.geoData.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-10">No geo data yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Management Table */}
        <div className="glass rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-lg font-bold">User Management</h3>
            <span className="text-sm text-gray-500">Total: {stats?.totalUsers || 0}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Plan</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={user.plan} 
                        onChange={(e) => overridePlan(user._id, e.target.value)}
                        className="bg-black border border-white/10 rounded-lg px-2 py-1 text-xs text-gray-300 outline-none focus:border-accent"
                      >
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="ultra">Ultra</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {user.isBanned ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-400/10 px-2 py-1 rounded-md">
                          <AlertTriangle size={12} /> Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-1 rounded-md">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/admin/users/${user._id}`)}
                          className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                          title="View Full Dossier"
                        >
                          <LinkIcon size={16} />
                        </button>
                        <button 
                          onClick={() => toggleBan(user._id, user.isBanned)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                          title={user.isBanned ? "Unban User" : "Ban User"}
                        >
                          <Shield size={16} className={user.isBanned ? "text-green-400" : "text-yellow-400"} />
                        </button>
                        <button 
                          onClick={() => deleteUser(user._id)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="glass rounded-3xl p-5 border border-white/5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
        <div className="p-2 rounded-xl bg-white/5">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-extrabold">{value}</p>
    </div>
  );
}
