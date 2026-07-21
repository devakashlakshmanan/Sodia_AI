import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getClientSession } from "@/lib/auth";
import { getAnalyticsDataAction } from "@/lib/server-actions.server";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Eye, MousePointerClick, Heart, Share2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, CartesianGrid
} from "recharts";

export const Route = createFileRoute("/dashboard/analytics")({
  component: AnalyticsDashboard,
});

function AnalyticsDashboard() {
  const user = getClientSession();
  const [timeframe, setTimeframe] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);

  const loadAnalytics = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await getAnalyticsDataAction({ data: { userId: user.id, timeframe } });
      setReport(res);
    } catch (e) {
      toast.error("Failed to load campaign analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Eye": return Eye;
      case "MousePointerClick": return MousePointerClick;
      case "Heart": return Heart;
      case "Share2":
      default:
        return Share2;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Campaign Analytics
          </h2>
          <p className="text-sm text-muted-foreground">Monitor performance metrics and engagement conversions across all connected profiles</p>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe} disabled={loading}>
          <SelectTrigger className="bg-background/40 w-[140px]">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <div className="space-y-6 py-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 w-full rounded-2xl bg-surface/30 animate-pulse" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-80 w-full rounded-2xl bg-surface/30 animate-pulse" />
            <div className="h-80 w-full rounded-2xl bg-surface/30 animate-pulse" />
          </div>
        </div>
      )}

      {report && !loading && (
        <>
          {/* Stats Widgets */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {report.summaryWidgets?.map((wid: any) => {
              const IconComponent = getIcon(wid.icon);
              return (
                <div key={wid.label} className="glass rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground">{wid.label}</span>
                    <h3 className="mt-1 font-display text-2xl font-bold">{wid.val}</h3>
                    <span className="mt-1 block text-[10px] text-muted-foreground">{wid.desc}</span>
                  </div>
                  <div className={`p-3 rounded-xl bg-surface/80 ${wid.color}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Growth Over Time */}
            <div className="glass rounded-3xl p-6 space-y-4">
              <div>
                <h3 className="font-display font-bold text-base">Campaign Reach Over Time</h3>
                <p className="text-xs text-muted-foreground">Growth of impressions compared to total actions taken</p>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={report.analyticsHistory}>
                    <defs>
                      <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.60 0.22 295)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="oklch(0.60 0.22 295)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ background: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-foreground)" }} />
                    <Area type="monotone" dataKey="impressions" name="Impressions" stroke="oklch(0.60 0.22 295)" fillOpacity={1} fill="url(#colorImpressions)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Platform breakdown */}
            <div className="glass rounded-3xl p-6 space-y-4">
              <div>
                <h3 className="font-display font-bold text-base">Performance By Platform</h3>
                <p className="text-xs text-muted-foreground">Total clicks directed to destination links by social network</p>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.platformPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                    <XAxis dataKey="platform" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ background: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-foreground)" }} />
                    <Bar dataKey="clicks" name="Clicks" radius={[6, 6, 0, 0]}>
                      {report.platformPerformance.map((entry: any, index: number) => (
                        <Bar key={`bar-${index}`} dataKey="clicks" fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Insights Panel */}
          {report.insights && (
            <div className="glass rounded-3xl p-6 space-y-4">
              <h3 className="font-display font-bold text-base flex items-center gap-1.5 border-b border-border/20 pb-3">
                <Sparkles className="h-5 w-5 text-primary" /> AI Campaign Insights & Optimization Report
              </h3>
              <div className="prose prose-invert max-w-none text-xs space-y-3 text-foreground/90 leading-relaxed">
                {report.insights.split("\n\n").map((para: string, idx: number) => {
                  if (para.startsWith("###")) {
                    return <h4 key={idx} className="font-display font-bold text-sm text-foreground mt-4">{para.replace("###", "")}</h4>;
                  }
                  if (para.startsWith("1.") || para.startsWith("-")) {
                    return <div key={idx} className="pl-4 border-l-2 border-primary/45 py-0.5">{para}</div>;
                  }
                  return <p key={idx}>{para}</p>;
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
