import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getClientSession, setClientSession } from "@/lib/auth";
import { runContentIdea } from "@/lib/server-actions.server";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Lightbulb, ArrowRight, Loader2, Award, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/ideas")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      prefillSummary: (search.prefillSummary as string) || "",
    };
  },
  component: IdeasAgent,
});

function IdeasAgent() {
  const user = getClientSession();
  const navigate = useNavigate();
  const { prefillSummary } = Route.useSearch();

  const [researchSummary, setResearchSummary] = useState("");
  const [goal, setGoal] = useState("brand awareness");
  const [loading, setLoading] = useState(false);
  const [ideasData, setIdeasData] = useState<any>(null);

  useEffect(() => {
    if (prefillSummary) {
      setResearchSummary(prefillSummary);
    }
  }, [prefillSummary]);

  const handleBrainstorm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !researchSummary || !goal) return;
    setLoading(true);
    try {
      const res = await runContentIdea({ data: { userId: user.id, researchSummary, goal } });
      if (res.error) {
        toast.error(res.error);
      } else {
        setIdeasData(res);
        toast.success("Ideas campaign brainstormed successfully! Saved to workspace.");
        user.credits = Math.max(0, user.credits - 1);
        setClientSession(user);
      }
    } catch (e) {
      toast.error("Failed to generate content ideas");
    } finally {
      setLoading(false);
    }
  };

  const flowToCaption = (title: string, hook: string) => {
    navigate({ to: "/dashboard/caption", search: { prefillTitle: title, prefillHook: hook } as any });
    toast.success(`Flowing idea "${title}" to Caption Studio Agent!`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Agent Intro */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" /> Content Idea Agent
          </h2>
          <p className="text-sm text-muted-foreground">Orchestrates campaign themes and maps out multi-network format variations</p>
        </div>
        <div className="text-xs font-mono bg-surface/50 border border-border/40 px-3 py-1.5 rounded-lg text-muted-foreground">
          Cost: <span className="text-accent-warm font-bold">1 credit</span> / brainstorm
        </div>
      </div>

      {/* Input Panel */}
      <form onSubmit={handleBrainstorm} className="glass rounded-3xl p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="summary" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Research Signals or Topic Inputs</Label>
          <Textarea
            id="summary"
            placeholder="Paste research keywords, competitor gaps, or raw topic briefs here..."
            value={researchSummary}
            onChange={(e) => setResearchSummary(e.target.value)}
            className="bg-background/40 min-h-24 resize-none"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Campaign Target Objective</Label>
            <Select value={goal} onValueChange={setGoal}>
              <SelectTrigger className="bg-background/40">
                <SelectValue placeholder="Goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brand awareness">Brand Awareness & Engagement</SelectItem>
                <SelectItem value="lead generation">Leads & Product Conversions</SelectItem>
                <SelectItem value="education">Audience Education & Value</SelectItem>
                <SelectItem value="community building">Community Trust & Discussions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button type="submit" variant="hero" className="w-full py-6 text-sm" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Brainstorming format layouts...
                </>
              ) : (
                <>
                  Brainstorm Campaign Ideas <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-3 py-6">
          <div className="h-48 rounded-2xl bg-surface/30 animate-pulse" />
          <div className="h-48 rounded-2xl bg-surface/30 animate-pulse" />
          <div className="h-48 rounded-2xl bg-surface/30 animate-pulse" />
        </div>
      )}

      {/* Results View */}
      {ideasData && !loading && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-border/20 pb-3">
            <div>
              <span className="text-[10px] font-mono text-primary uppercase">Brainstormed Campaign</span>
              <h3 className="font-display font-bold text-lg">{ideasData.campaignTitle}</h3>
            </div>
            <span className="text-[10px] bg-green-500/10 text-green-400 font-bold px-2 py-1 rounded-full">
              Saved to Workspace
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {ideasData.ideas?.map((idea: any, idx: number) => (
              <div key={idx} className="glass rounded-2xl p-5 flex flex-col justify-between hover:border-primary/50 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                      {idea.format}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">Concept / {String(idx + 1).padStart(2, "0")}</span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-foreground">{idea.title}</h4>
                  <div className="rounded-xl bg-surface/50 border border-border/30 p-3">
                    <span className="text-[9px] font-mono text-accent-warm uppercase">Opening Hook</span>
                    <p className="text-xs text-foreground/90 font-medium mt-1 leading-normal italic">"{idea.hook}"</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-normal">{idea.description}</p>
                </div>

                <Button
                  onClick={() => flowToItem(idea)}
                  variant="glass"
                  className="mt-6 w-full text-xs font-bold py-5"
                >
                  Write Caption <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  function flowToItem(idea: any) {
    flowToCaption(idea.title, idea.hook);
  }
}

