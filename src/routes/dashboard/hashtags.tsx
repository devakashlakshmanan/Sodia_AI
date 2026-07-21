import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getClientSession, setClientSession } from "@/lib/auth";
import { runHashtagIntelligence } from "@/lib/server-actions.server";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Hash, ArrowRight, Loader2, Copy, Check, BarChart3, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/hashtags")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      prefillCaption: (search.prefillCaption as string) || "",
    };
  },
  component: HashtagAgent,
});

function HashtagAgent() {
  const user = getClientSession();
  const navigate = useNavigate();
  const { prefillCaption } = Route.useSearch();

  const [captionText, setCaptionText] = useState("");
  const [loading, setLoading] = useState(false);
  const [hashtags, setHashtags] = useState<any>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (prefillCaption) {
      setCaptionText(prefillCaption);
    }
  }, [prefillCaption]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !captionText) return;
    setLoading(true);
    setSelectedTags([]);
    try {
      const res = await runHashtagIntelligence({ data: { userId: user.id, captionText } });
      if (res.error) {
        toast.error(res.error);
      } else {
        setHashtags(res);
        toast.success("Hashtags intelligence compiled! Saved to workspace.");
        user.credits = Math.max(0, user.credits - 1);
        setClientSession(user);
      }
    } catch (e) {
      toast.error("Failed to map hashtags");
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const copyTags = (all = false) => {
    if (!hashtags) return;
    const tagsToCopy = all
      ? [
          ...hashtags.trending.map((t: any) => t.tag),
          ...hashtags.niche.map((t: any) => t.tag),
          ...hashtags.lowCompetition.map((t: any) => t.tag)
        ]
      : selectedTags;

    if (tagsToCopy.length === 0) {
      toast.warning("No hashtags selected to copy.");
      return;
    }

    navigator.clipboard.writeText(tagsToCopy.join(" "));
    setCopied(true);
    toast.success(`Copied ${tagsToCopy.length} tags to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const flowToPrediction = () => {
    if (!hashtags) return;
    const selectedText = selectedTags.join(" ");
    navigate({
      to: "/dashboard/prediction",
      search: {
        prefillCaption: captionText,
        prefillHashtags: selectedText || hashtags.trending.map((t: any) => t.tag).slice(0, 5).join(" ")
      } as any
    });
    toast.success("Flowing post copy to Engagement Predictor!");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Agent Intro */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <Hash className="h-6 w-6 text-primary" /> Hashtag Intelligence Agent
          </h2>
          <p className="text-sm text-muted-foreground">Scans search volumes and reach limits to curate high-engagement tag groupings</p>
        </div>
        <div className="text-xs font-mono bg-surface/50 border border-border/40 px-3 py-1.5 rounded-lg text-muted-foreground">
          Cost: <span className="text-accent-warm font-bold">1 credit</span> / mapping
        </div>
      </div>

      {/* Input Panel */}
      <form onSubmit={handleGenerate} className="glass rounded-3xl p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="caption" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Focus Post Copy or Caption</Label>
          <Textarea
            id="caption"
            placeholder="Paste your caption or campaign copy here to analyze intent and suggest tags..."
            value={captionText}
            onChange={(e) => setCaptionText(e.target.value)}
            className="bg-background/40 min-h-24 resize-none"
            required
          />
        </div>

        <Button type="submit" variant="hero" className="w-full py-6 text-sm" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gathering index data & scoring reach factors...
            </>
          ) : (
            <>
              Generate Targeted Hashtags <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-3 py-6">
          <div className="h-44 rounded-xl bg-surface/30 animate-pulse" />
          <div className="h-44 rounded-xl bg-surface/30 animate-pulse" />
          <div className="h-44 rounded-xl bg-surface/30 animate-pulse" />
        </div>
      )}

      {/* Results View */}
      {hashtags && !loading && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/20 pb-3">
            <div>
              <span className="text-[10px] font-mono text-primary uppercase">Scored Tags</span>
              <h3 className="font-display font-bold text-base">Select tags to group for clipboard</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => copyTags(false)} variant="glass" size="sm" className="text-xs" disabled={selectedTags.length === 0}>
                Copy Selected ({selectedTags.length})
              </Button>
              <Button onClick={() => copyTags(true)} variant="glass" size="sm" className="text-xs">
                Copy All Scored
              </Button>
              <Button onClick={flowToPrediction} variant="hero" size="sm" className="text-xs">
                <BarChart3 className="mr-1.5 h-3.5 w-3.5" /> Predict Engagement
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Category columns */}
            {[
              { title: "Trending & High Reach", data: hashtags.trending, badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
              { title: "Niche & Specific Audience", data: hashtags.niche, badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
              { title: "Low-Competition Catalyst", data: hashtags.lowCompetition, badgeColor: "bg-green-500/10 text-green-400 border-green-500/20" }
            ].map((col, cIdx) => (
              <div key={cIdx} className="glass rounded-2xl p-5 space-y-4">
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  {col.title}
                </h4>
                <div className="space-y-2">
                  {col.data?.map((item: any, idx: number) => {
                    const selected = selectedTags.includes(item.tag);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleTag(item.tag)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          selected
                            ? "border-primary bg-primary/10"
                            : "border-border/30 bg-surface/30 hover:border-border/80"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-semibold text-foreground font-mono">{item.tag}</span>
                          <span className="block text-[9px] text-muted-foreground">Reach: {item.volume}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded-md ${col.badgeColor}`}>
                            {item.score}
                          </span>
                          {selected ? (
                            <Minus className="h-3 w-3 text-primary" />
                          ) : (
                            <Plus className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

