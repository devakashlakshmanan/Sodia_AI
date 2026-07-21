import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { getClientSession } from "@/lib/auth";
import { runTrendAnalysis } from "@/lib/server-actions.server";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, TrendingUp, ArrowRight, Loader2, Award, Zap, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/trends")({
  component: TrendsAgent,
});

function TrendsAgent() {
  const user = getClientSession();
  const navigate = useNavigate();
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleScan = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await runTrendAnalysis({ data: { userId: user.id, category } });
      if (res.error) {
        toast.error(res.error);
      } else {
        setReport(res);
        toast.success("Trend analysis completed! Saved to workspace.");
        // Deduct client-side display credit
        user.credits = Math.max(0, user.credits - 2);
      }
    } catch (e) {
      toast.error("Failed to run trend scan");
    } finally {
      setLoading(false);
    }
  };

  const flowToResearch = (topic: string) => {
    navigate({ to: "/dashboard/research", search: { prefillTopic: topic } as any });
    toast.success(`Flowing trend topic "${topic}" to Research Agent!`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Agent Intro */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" /> Trend Analysis Agent
          </h2>
          <p className="text-sm text-muted-foreground">Scans breaking news & Google Trends to capture hot topics before they saturate</p>
        </div>
        <div className="text-xs font-mono bg-surface/50 border border-border/40 px-3 py-1.5 rounded-lg text-muted-foreground">
          Cost: <span className="text-accent-warm font-bold">2 credits</span> / scan
        </div>
      </div>

      {/* Control Panel */}
      <div className="glass rounded-3xl p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Select Search Industry</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-background/40">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Trends</SelectItem>
                <SelectItem value="technology">Technology & AI</SelectItem>
                <SelectItem value="business">Business & Finance</SelectItem>
                <SelectItem value="science">Science & Health</SelectItem>
                <SelectItem value="sports">Sports & Gaming</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={handleScan} variant="hero" className="w-full py-6 text-sm" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing feeds & scanning trends...
                </>
              ) : (
                <>
                  Scan Industry Trends <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Loading Placeholder */}
      {loading && (
        <div className="space-y-4 py-8">
          <div className="h-12 w-full rounded-2xl bg-surface/30 animate-pulse" />
          <div className="h-44 w-full rounded-2xl bg-surface/30 animate-pulse" />
        </div>
      )}

      {/* Results View */}
      {report && !loading && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Topics list */}
          <div className="glass rounded-3xl p-6 space-y-4 md:col-span-2">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Award className="h-4.5 w-4.5 text-accent-warm" /> High-Growth Topics
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {report.topics?.map((topic: any, idx: number) => (
                <div key={idx} className="rounded-2xl border border-border/40 bg-surface/40 p-4 space-y-3 hover:border-primary/40 transition-colors flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground leading-snug">{topic.name}</span>
                      <span className="text-[10px] font-mono font-bold text-accent-warm bg-accent-warm/10 px-2 py-0.5 rounded-lg whitespace-nowrap">{topic.growth}</span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground leading-normal line-clamp-3">{topic.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] border-t border-border/10 pt-2">
                      <span className="font-mono text-muted-foreground">Source:</span>
                      <span className="bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-md">{topic.source}</span>
                      <span className="text-muted-foreground ml-auto">Reach: <strong className="text-foreground">{topic.score}/10</strong></span>
                    </div>

                    {topic.whyTrending && (
                      <div className="rounded-xl bg-accent/5 border border-accent/15 p-2.5 text-[11px] text-foreground/80 leading-normal">
                        <span className="font-mono text-[9px] font-bold text-primary uppercase block mb-0.5">Why it's trending</span>
                        {topic.whyTrending}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border/10 mt-2 flex items-center justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => flowToResearch(topic.name)}
                      className="h-8 text-[11px] font-bold px-3 text-primary hover:text-primary-foreground hover:bg-primary gap-1"
                    >
                      Research topic <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights Report */}
          <div className="glass rounded-3xl p-6 md:col-span-1 space-y-4">
            <div className="flex items-center justify-between border-b border-border/20 pb-3">
              <div>
                <span className="text-[10px] font-mono text-primary uppercase">Trend Report Summary</span>
                <h3 className="font-display font-bold text-lg leading-tight mt-0.5">{report.reportTitle}</h3>
              </div>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center gap-1 text-[10px] bg-green-500/10 text-green-400 font-bold px-2 py-1 rounded-full">
                <Check className="h-3 w-3" /> Saved to Workspace
              </span>
            </div>

            <div className="rounded-2xl bg-surface/30 p-4 border border-border/20 text-xs leading-relaxed text-muted-foreground italic">
              "{report.summary}"
            </div>

            <div className="prose prose-invert max-w-none text-xs space-y-3 text-foreground/90 border-t border-border/10 pt-3">
              {report.insights?.split("\n\n").map((para: string, idx: number) => {
                if (para.startsWith("###")) {
                  return <h4 key={idx} className="font-display font-bold text-sm text-foreground mt-3">{para.replace("###", "")}</h4>;
                }
                return <p key={idx} className="leading-relaxed">{para}</p>;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

