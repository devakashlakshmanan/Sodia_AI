import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getClientSession } from "@/lib/auth";
import { runContentResearch } from "@/lib/server-actions.server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, ArrowRight, Loader2, Search, Check, AlertCircle, BarChart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/research")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      prefillTopic: (search.prefillTopic as string) || "",
    };
  },
  component: ResearchAgent,
});

function ResearchAgent() {
  const user = getClientSession();
  const navigate = useNavigate();
  const { prefillTopic } = Route.useSearch();

  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("content creators & social marketers");
  const [loading, setLoading] = useState(false);
  const [research, setResearch] = useState<any>(null);

  // Pre-fill topic if navigated from Trends Agent
  useEffect(() => {
    if (prefillTopic) {
      setTopic(prefillTopic);
    }
  }, [prefillTopic]);

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !topic || !targetAudience) return;
    setLoading(true);
    try {
      const res = await runContentResearch({ data: { userId: user.id, topic, targetAudience } });
      if (res.error) {
        toast.error(res.error);
      } else {
        setResearch(res);
        toast.success("Research signals compiled successfully! Saved to workspace.");
        user.credits = Math.max(0, user.credits - 1);
      }
    } catch (e) {
      toast.error("Failed to run competitor scan");
    } finally {
      setLoading(false);
    }
  };

  const flowToIdeas = () => {
    if (!research) return;
    const summary = `${research.researchSummary} Gaps: ${research.competitorGaps.join("; ")}`;
    navigate({ to: "/dashboard/ideas", search: { prefillSummary: summary } as any });
    toast.success("Flowing research metrics to Content Idea Agent!");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Agent Intro */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" /> Content Research Agent
          </h2>
          <p className="text-sm text-muted-foreground">Scrapes competitor strategies and gathers search intent maps for your campaign</p>
        </div>
        <div className="text-xs font-mono bg-surface/50 border border-border/40 px-3 py-1.5 rounded-lg text-muted-foreground">
          Cost: <span className="text-accent-warm font-bold">1 credit</span> / analysis
        </div>
      </div>

      {/* Input Panel */}
      <form onSubmit={handleResearch} className="glass rounded-3xl p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Focus Campaign Topic</Label>
            <div className="relative">
              <Input
                id="topic"
                placeholder="e.g. AI-driven social media management"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-background/40 pl-10"
                required
              />
              <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Target Audience Persona</Label>
            <Input
              id="audience"
              placeholder="e.g. tech founders, marketing executives"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="bg-background/40"
              required
            />
          </div>
        </div>

        <Button type="submit" variant="hero" className="w-full py-6 text-sm" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gathering signals & scanning competitor gaps...
            </>
          ) : (
            <>
              Analyze Topic Signals <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 py-6">
          <div className="h-10 w-full rounded-xl bg-surface/30 animate-pulse" />
          <div className="h-32 w-full rounded-xl bg-surface/30 animate-pulse" />
        </div>
      )}

      {/* Results View */}
      {research && !loading && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Keywords & Stats */}
          <div className="glass rounded-3xl p-6 md:col-span-1 space-y-5">
            <div>
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BarChart className="h-4.5 w-4.5 text-primary" /> Focus Keywords
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Keywords with high conversion potential</p>
            </div>
            <div className="space-y-3">
              {research.suggestedKeywords?.map((kw: any, idx: number) => (
                <div key={idx} className="rounded-xl border border-border/40 bg-surface/40 p-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground font-mono">{kw.word}</span>
                    <span className="block text-[9px] text-muted-foreground">Vol: {kw.volume}</span>
                  </div>
                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                    Score {kw.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Core Findings & Gaps */}
          <div className="glass rounded-3xl p-6 md:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-border/20 pb-3">
              <div>
                <span className="text-[10px] font-mono text-primary uppercase">Research Analysis</span>
                <h3 className="font-display font-bold text-lg">Competitor & Audience Intelligence</h3>
              </div>
              <Button
                size="sm"
                onClick={flowToIdeas}
                className="bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-semibold"
              >
                Send to Content Idea <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>

            {/* Pain Points */}
            <div className="space-y-2">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-muted-foreground">Audience Friction Points</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {research.audiencePainPoints?.map((pain: string, idx: number) => (
                  <div key={idx} className="flex gap-2 rounded-xl border border-border/20 bg-surface/20 p-3.5 text-xs text-foreground/90">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0 text-amber-500" />
                    <span>{pain}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gaps */}
            <div className="space-y-2">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-muted-foreground">Competitor Strategy Gaps</h4>
              <ul className="space-y-2">
                {research.competitorGaps?.map((gap: string, idx: number) => (
                  <li key={idx} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                    <Check className="h-4.5 w-4.5 shrink-0 text-green-500 mt-0.5" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

