import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { 
  LayoutGrid, 
  BarChart3, 
  Folder, 
  Database, 
  Users, 
  Calendar, 
  Code, 
  Settings, 
  Search, 
  Bell, 
  User, 
  TrendingUp, 
  Plus,
  ArrowUpRight,
  ShieldCheck,
  MessageSquare,
  Crown
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";



export default function PremiumDashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, chartsRes, usersRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/charts"),
          api.get("/admin/users")
        ]);
        setStats(statsRes.data);
        setCharts(chartsRes.data);
        setUsers(usersRes.data.users);
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const timelineData = charts?.usersTimeline?.map(d => ({
    name: d._id,
    count: d.count
  })) || [
    { name: "Week 1", count: 40 },
    { name: "Week 2", count: 30 },
    { name: "Week 3", count: 60 },
    { name: "Week 4", count: 80 },
  ];

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-[var(--accent)] rounded-2xl" />
        <span className="text-[var(--text-secondary)] font-bold">Loading God Mode...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 md:p-8 font-sans text-[var(--text-primary)] transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto bg-[var(--glass-bg)] backdrop-blur-2xl rounded-[40px] shadow-2xl border border-[var(--border-color)] flex overflow-hidden min-h-[90vh]">
        
        {/* Sidebar */}
        <aside className="w-64 border-r border-[var(--border-color)] p-8 flex flex-col gap-10">
          <div className="flex items-center gap-3 px-2 cursor-pointer" onClick={() => navigate("/")}>
             <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white shadow-lg">
                <ShieldCheck size={24} />
             </div>
             <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">God Mode</span>
          </div>

          <nav className="flex flex-col gap-2">
            {[
              { icon: LayoutGrid, label: "Dashboard" },
              { icon: Users, label: "Users" },
              { icon: MessageSquare, label: "Feedback" },
              { icon: Crown, label: "Plans" },
              { icon: BarChart3, label: "Analytics" },
              { icon: Database, label: "System" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  activeTab === item.label 
                    ? "bg-[var(--bg-secondary)] shadow-md text-[var(--text-primary)]" 
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/40 hover:text-[var(--text-primary)]"
                }`}
              >
                <item.icon size={20} />
                <span className="font-semibold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto">
             <button onClick={() => navigate("/")} className="flex items-center gap-4 px-4 py-3 rounded-2xl text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/40 hover:text-red-500 transition-all w-full">
                <ArrowUpRight size={20} />
                <span className="font-semibold text-sm">Exit Admin</span>
             </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-10 overflow-y-auto">
          <header className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-serif text-[var(--text-primary)]">Welcome, Admin</h1>
              <p className="text-[var(--text-secondary)] text-sm mt-1">Everything looks healthy today.</p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="bg-[var(--bg-secondary)]/80 border border-[var(--border-color)] rounded-2xl py-3 pl-12 pr-6 w-64 outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all text-sm text-[var(--text-primary)]"
                />
              </div>
              <button className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] hover:shadow-md transition-all relative">
                <Bell size={20} />
                <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg-secondary)]" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-gray-200 overflow-hidden border-2 border-[var(--bg-secondary)] shadow-sm">
                <img src="https://ui-avatars.com/api/?name=Admin&background=1C1C1C&color=fff" alt="Admin" />
              </div>
            </div>
          </header>

          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Platform Insights</h2>
                <button className="px-5 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold shadow-lg hover:scale-105 transition-all">Export Data</button>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* MRR Card */}
                <div className="bg-[var(--bg-secondary)]/80 rounded-[32px] p-8 border border-[var(--border-color)] shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">Total MRR</p>
                      <h3 className="text-3xl font-bold text-[var(--text-primary)]">₹{stats?.mrr || 0}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-1 rounded-lg text-xs font-bold">
                       <TrendingUp size={12} />
                       {stats?.conversionRate}% Conv.
                    </div>
                  </div>
                  <div className="h-40 -mx-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timelineData}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Tooltip 
                          contentStyle={{ background: 'var(--bg-secondary)', borderRadius: '16px', border: 'none', color: 'var(--text-primary)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke="var(--accent)" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#colorCount)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Users Card */}
                <div className="bg-[var(--bg-secondary)]/80 rounded-[32px] p-8 border border-[var(--border-color)] shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">Daily Active Users</p>
                      <h3 className="text-3xl font-bold text-[var(--text-primary)]">{stats?.dau || 0}</h3>
                    </div>
                    <div className="text-red-400 bg-red-400/10 px-2 py-1 rounded-lg text-xs font-bold">
                       {stats?.totalUsers} Total
                    </div>
                  </div>
                  <div className="h-40 -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timelineData}>
                        <Tooltip 
                          contentStyle={{ background: 'var(--bg-secondary)', borderRadius: '16px', border: 'none', color: 'var(--text-primary)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                        <Bar 
                          dataKey="count" 
                          fill="var(--accent)" 
                          opacity={0.6}
                          radius={[6, 6, 0, 0]} 
                          barSize={18}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* User Management */}
              <div className="bg-[var(--bg-secondary)]/80 rounded-[32px] p-8 border border-[var(--border-color)] shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Recent Users</h2>
                  <button onClick={() => setActiveTab("Users")} className="px-5 py-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-semibold hover:bg-[var(--accent)]/20 transition-all">
                    View All
                  </button>
                </div>

                <table className="w-full">
                  <thead>
                    <tr className="text-[var(--text-secondary)] text-sm font-medium text-left border-b border-[var(--border-color)]">
                      <th className="pb-4 font-normal">Username</th>
                      <th className="pb-4 font-normal">Plan</th>
                      <th className="pb-4 font-normal">Status</th>
                      <th className="pb-4 font-normal text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {users.slice(0, 5).map((u, idx) => (
                      <tr key={idx} className="group">
                        <td className="py-5">
                          <p className="font-semibold text-[var(--text-primary)]">{u.username}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{u.email}</p>
                        </td>
                        <td className="py-5">
                          <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${
                            u.plan === "ultra" ? "bg-[var(--accent)]/10 text-[var(--accent)]" :
                            u.plan === "pro" ? "bg-purple-500/10 text-purple-500" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                          }`}>
                            {u.plan}
                          </span>
                        </td>
                        <td className="py-5">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${u.isBanned ? "bg-red-500" : "bg-green-500"}`} />
                            <span className="text-sm font-medium text-[var(--text-secondary)]">{u.isBanned ? "Banned" : "Active"}</span>
                          </div>
                        </td>
                        <td className="py-5 text-right">
                           <button onClick={() => navigate(`/admin/users/${u._id}`)} className="text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                             <ArrowUpRight size={18} />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-span-1 space-y-8">
              {/* Activity Feed */}
              <div className="bg-[var(--bg-secondary)]/80 rounded-[32px] p-8 border border-[var(--border-color)] shadow-sm">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-8">Activity Feed</h2>
                <div className="space-y-6 relative">
                  <div className="absolute left-6 top-8 bottom-8 w-[2px] bg-[var(--border-color)] -z-10" />
                  {users.slice(0, 3).map((u, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-2xl bg-gray-200 overflow-hidden border-2 border-[var(--bg-secondary)] shadow-sm shrink-0">
                        <img src={`https://ui-avatars.com/api/?name=${u.username}&background=random`} alt={u.username} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-[var(--text-primary)] text-sm">{u.username}</h4>
                          <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">joined</span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">Account created under {u.plan} plan.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Health */}
              <div className="bg-[var(--bg-secondary)]/80 rounded-[32px] p-8 border border-[var(--border-color)] shadow-sm">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-8">System Health</h2>
                <div className="space-y-4">
                  {[
                    { title: "Database", status: "Operational", color: "text-green-500", bg: "bg-green-500/10" },
                    { title: "Server Load", status: "Normal", color: "text-blue-500", bg: "bg-blue-500/10" },
                    { title: "Payments", status: "Live", color: "text-purple-500", bg: "bg-purple-500/10" },
                  ].map((n, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--border-color)]">
                      <div className={`w-10 h-10 rounded-xl ${n.bg} flex items-center justify-center ${n.color}`}>
                        <ShieldCheck size={18} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-[var(--text-primary)] text-xs">{n.title}</h4>
                        <p className="text-[10px] text-[var(--text-secondary)]">{n.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
