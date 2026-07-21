import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getClientSession, setClientSession } from "@/lib/auth";
import { runEngagementPrediction } from "@/lib/server-actions.server";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Workflow, ArrowRight, Loader2, Award, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/prediction")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      prefillCaption: (search.prefillCaption as string) || "",
      prefillHashtags: (search.prefillHashtags as string) || "",
    };
  },
  component: PredictionAgent,
});

function PredictionAgent() {
  const user = getClientSession();
  const { prefillCaption, prefillHashtags } = Route.useSearch();

  const [captionText, setCaptionText] = useState("");
  const [hashtagsText, setHashtagsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);

  useEffect(() => {
    if (prefillCaption) setCaptionText(prefillCaption);
    if (prefillHashtags) setHashtagsText(prefillHashtags);
  }, [prefillCaption, prefillHashtags]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !captionText) return;
    setLoading(true);
    try {
      const res = await runEngagementPrediction({ data: { userId: user.id, captionText, hashtagsText } });
      if (res.error) {
        toast.error(res.error);
      } else {
        setPrediction(res);
        toast.success("Engagement scored successfully! Saved to workspace.");
        user.credits = Math.max(0, user.credits - 1);
        setClientSession(user);
      }
    } catch (e) {
      toast.error("Failed to run prediction score");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Agent Intro */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <Workflow className="h-6 w-6 text-primary" /> Engagement Prediction Agent
          </h2>
          <p className="text-sm text-muted-foreground">Evaluates copy readability, formatting index, and reach signals to score virality</p>
        </div>
        <div className="text-xs font-mono bg-surface/50 border border-border/40 px-3 py-1.5 rounded-lg text-muted-foreground">
          Cost: <span className="text-accent-warm font-bold">1 credit</span> / evaluation
        </div>
      </div>

      {/* Input Panel */}
      <form onSubmit={handlePredict} className="glass rounded-3xl p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="caption" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Post Text / Caption</Label>
            <Textarea
              id="caption"
              placeholder="Paste your caption copywriting here to predict engagement potential..."
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              className="bg-background/40 min-h-24 resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Hashtags / Keywords</Label>
            <Textarea
              id="tags"
              placeholder="Paste your hashtags here to verify reach scores..."
              value={hashtagsText}
              onChange={(e) => setHashtagsText(e.target.value)}
              className="bg-background/40 min-h-24 resize-none"
            />
          </div>
        </div>

        <Button type="submit" variant="hero" className="w-full py-6 text-sm" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Evaluating post layout & analyzing algorithms...
            </>
          ) : (
            <>
              Predict Virality Score <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 py-6">
          <div className="h-14 w-full rounded-xl bg-surface/30 animate-pulse" />
          <div className="h-44 w-full rounded-xl bg-surface/30 animate-pulse" />
        </div>
      )}

      {/* Results View */}
      {prediction && !loading && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Circular Score display */}
          <div className="glass rounded-3xl p-6 md:col-span-1 flex flex-col items-center justify-center text-center space-y-4">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-muted-foreground">Virality Index</h3>
            <div className="relative flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle cx="72" cy="72" r="60" stroke="rgba(255,255,255,0.06)" strokeWidth="10" fill="transparent" />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="oklch(0.68 0.22 295)"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={376.8}
                  strokeDashoffset={376.8 - (376.8 * prediction.score) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-display font-bold">{prediction.score}</span>
                <span className="block text-[10px] text-muted-foreground uppercase font-mono mt-0.5">Reach: {prediction.reachFactor}</span>
              </div>
            </div>
            <div className="w-full space-y-2 mt-4 text-left">
              {[
                { label: "Hook Strength", val: prediction.viralitySignals?.hookStrength || 80 },
                { label: "Readability", val: prediction.viralitySignals?.readability || 80 },
                { label: "Formatting", val: prediction.viralitySignals?.formatting || 75 }
              ].map((sig) => (
                <div key={sig.label} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                    <span>{sig.label}</span>
                    <span>{sig.val}%</span>
                  </div>
                  <Progress value={sig.val} className="h-1 bg-surface" />
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Advice List */}
          <div className="glass rounded-3xl p-6 md:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-border/20 pb-3">
              <div>
                <span className="text-[10px] font-mono text-primary uppercase">Optimizations</span>
                <h3 className="font-display font-bold text-base">Recommended Improvements</h3>
              </div>
              <span className="text-[10px] bg-green-500/10 text-green-400 font-bold px-2 py-1 rounded-full">
                Scored Report Saved
              </span>
            </div>

            <div className="space-y-3">
              {prediction.improvements?.map((imp: string, idx: number) => (
                <div key={idx} className="flex gap-2.5 items-start p-3.5 rounded-2xl border border-border/20 bg-surface/30 text-xs leading-normal">
                  <CheckCircle className="h-4.5 w-4.5 shrink-0 text-primary mt-0.5" />
                  <span className="text-foreground/90 font-medium">{imp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

