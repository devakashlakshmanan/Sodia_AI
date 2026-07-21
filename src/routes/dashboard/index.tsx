import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getClientSession } from "@/lib/auth";
import { getWorkspaceItemsAction, getCalendarEventsAction } from "@/lib/server-actions.server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, Brain, Calendar, Star, BarChart3, ArrowRight,
  Zap, Layers, Image as ImageIcon, Eye, MousePointerClick, Heart, MessageSquare
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  const user = getClientSession();
  const [workspaceCount, setWorkspaceCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadStats = async () => {
      try {
        const [items, events] = await Promise.all([
          getWorkspaceItemsAction({ data: { userId: user.id } }),
          getCalendarEventsAction({ data: { userId: user.id } })
        ]);
        setWorkspaceCount(items.length);
        setEventsCount(events.length);
        setRecentItems(items.slice(0, 4));
      } catch (err) {
        toast.error("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const stats = [
    { title: "Remaining Credits", value: user?.credits ?? 0, desc: "Refreshes monthly", icon: Zap, color: "text-accent-warm" },
    { title: "Workspace Items", value: workspaceCount, desc: "Saved agent creations", icon: Star, color: "text-primary" },
    { title: "Scheduled Posts", value: eventsCount, desc: "Active calendar events", icon: Calendar, color: "text-blue-400" },
    { title: "Total Engagement", value: "9.2K", desc: "+12% this week", icon: BarChart3, color: "text-green-400" }
  ];

  // Recharts Data
  const performanceData = [
    { name: "Mon", views: 800, clicks: 120 },
    { name: "Tue", views: 1200, clicks: 210 },
    { name: "Wed", views: 950, clicks: 150 },
    { name: "Thu", views: 1450, clicks: 280 },
    { name: "Fri", views: 2300, clicks: 420 },
    { name: "Sat", views: 1900, clicks: 350 },
    { name: "Sun", views: 2450, clicks: 490 }
  ];

  const formatDistribution = [
    { name: "LinkedIn", value: 35, color: "#0077B5" },
    { name: "X (Twitter)", value: 25, color: "#1DA1F2" },
    { name: "Instagram", value: 25, color: "#E1306C" },
    { name: "Threads", value: 15, color: "#8B5CF6" }
  ];

  const agentLinks = [
    { label: "Scan Trends", to: "/dashboard/trends", icon: TrendingUp, desc: "Google Trends & news analysis", color: "from-purple-500/10 to-indigo-500/5 hover:border-purple-500/40" },
    { label: "Target Research", to: "/dashboard/research", icon: Brain, desc: "Audience & keywords gaps", color: "from-blue-500/10 to-indigo-500/5 hover:border-blue-500/40" },
    { label: "Write Captions", to: "/dashboard/caption", icon: MessageSquare, desc: "Multi-network copywriting", color: "from-pink-500/10 to-rose-500/5 hover:border-pink-500/40" },
    { label: "AI Image Studio", to: "/dashboard/image", icon: ImageIcon, desc: "Create high-fidelity visuals", color: "from-amber-500/10 to-orange-500/5 hover:border-amber-500/40" }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-surface to-accent-warm/5 p-6 md:p-8 glow-primary">
        <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Welcome back, <span className="text-gradient">{user?.fullName || "Creator"}</span>!
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          Your AI agent team is fully online. Use the quick launch shortcuts below to research keywords, brainstorm content, or schedule posts.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.title} className="glass rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground">{s.title}</span>
              <h3 className="mt-1 font-display text-2xl font-bold">{loading ? "..." : s.value}</h3>
              <span className="mt-1 block text-[10px] text-muted-foreground">{s.desc}</span>
            </div>
            <div className={`p-3 rounded-xl bg-surface/80 ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts area */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Engagement Trend Chart */}
        <div className="glass rounded-3xl p-6 lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-display text-base font-bold">Impressions & Clicks Trend</h3>
            <p className="text-xs text-muted-foreground">Historical visual click rates across scheduled networks</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.68 0.22 295)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="oklch(0.68 0.22 295)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.82 0.16 75)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="oklch(0.82 0.16 75)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#1b1928", borderColor: "#323048", borderRadius: "12px", color: "#fff" }} />
                <Area type="monotone" dataKey="views" name="Impressions" stroke="oklch(0.68 0.22 295)" fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="clicks" name="Clicks" stroke="oklch(0.82 0.16 75)" fillOpacity={1} fill="url(#colorClicks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Network Share Donut Chart */}
        <div className="glass rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-bold">Network Share</h3>
            <p className="text-xs text-muted-foreground">Distribution of publishing posts per network</p>
          </div>
          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={formatDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                  {formatDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-[10px] text-muted-foreground uppercase font-mono">Total Posts</span>
              <p className="text-xl font-bold">{loading ? "..." : eventsCount || 12}</p>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {formatDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Launch Panel */}
      <div className="space-y-3">
        <h3 className="font-display text-base font-bold">Quick Launch Agent Workflows</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {agentLinks.map((al) => (
            <Link key={al.label} to={al.to} className={`block group rounded-2xl border border-border/40 bg-gradient-to-br p-5 transition-all duration-300 ${al.color}`}>
              <div className="inline-flex p-3 rounded-xl bg-surface/80 text-primary mb-3 transition-colors group-hover:bg-primary/20">
                <al.icon className="h-5 w-5" />
              </div>
              <h4 className="font-display font-bold group-hover:text-primary transition-colors flex items-center gap-1">
                {al.label} <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-normal">{al.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity & saved items */}
      <div className="glass rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold">Recent Saved Creations</h3>
            <p className="text-xs text-muted-foreground">Latest outputs cataloged in your workspace</p>
          </div>
          <Link to="/dashboard/saved" className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
            View saved workspace <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2 py-4">
            <div className="h-10 w-full rounded-lg bg-surface/50 animate-pulse" />
            <div className="h-10 w-full rounded-lg bg-surface/50 animate-pulse" />
          </div>
        ) : recentItems.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No items saved yet. Run any AI agent to generate and save your first asset!
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {recentItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-surface text-primary font-mono text-xs">
                    {item.agentType.substring(0, 3)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{item.title}</h4>
                    <p className="text-[10px] text-muted-foreground">Saved on {new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <Link to="/dashboard/saved" className="text-xs text-muted-foreground hover:text-foreground">
                  Open
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

