import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getClientSession, setClientSession } from "@/lib/auth";
import { runCaptionStudio, saveCalendarEventAction } from "@/lib/server-actions.server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MessageSquare, ArrowRight, Loader2, Copy, Check, Calendar, Hash, Layers } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/caption")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      prefillTitle: (search.prefillTitle as string) || "",
      prefillHook: (search.prefillHook as string) || "",
    };
  },
  component: CaptionAgent,
});

function CaptionAgent() {
  const user = getClientSession();
  const navigate = useNavigate();
  const { prefillTitle, prefillHook } = Route.useSearch();

  const [ideaTitle, setIdeaTitle] = useState("");
  const [hookHint, setHookHint] = useState("");
  const [tone, setTone] = useState("creative");
  const [platform, setPlatform] = useState("linkedin");
  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Calendar Schedule State
  const [scheduling, setScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  useEffect(() => {
    if (prefillTitle) setIdeaTitle(prefillTitle);
    if (prefillHook) setHookHint(prefillHook);
  }, [prefillTitle, prefillHook]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !ideaTitle) return;
    setLoading(true);
    try {
      const res = await runCaptionStudio({
        data: { userId: user.id, ideaTitle: `${ideaTitle} ${hookHint ? `(Hook hint: ${hookHint})` : ""}`, tone, platform }
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        setCaption(res);
        toast.success("Caption generated and saved! Tone rules applied.");
        user.credits = Math.max(0, user.credits - 1);
        setClientSession(user);
      }
    } catch (e) {
      toast.error("Failed to write copy");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!caption) return;
    const fullText = `${caption.hook}\n\n${caption.body}\n\n${caption.cta}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success("Copied full caption to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSchedule = async () => {
    if (!user || !caption || !scheduleDate) return;
    setScheduling(true);
    try {
      const fullText = `${caption.hook}\n\n${caption.body}\n\n${caption.cta}`;
      const res = await saveCalendarEventAction({
        data: {
          userId: user.id,
          title: `Post: ${ideaTitle.substring(0, 30)}`,
          content: fullText,
          platforms: platform,
          scheduledAt: new Date(scheduleDate).toISOString(),
          status: "SCHEDULED"
        }
      });
      toast.success("Scheduled successfully! Added to Content Calendar.");
      setScheduleDate("");
    } catch (e) {
      toast.error("Failed to schedule post");
    } finally {
      setScheduling(false);
    }
  };

  const flowToHashtags = () => {
    if (!caption) return;
    const fullText = `${caption.hook} ${caption.body}`;
    navigate({ to: "/dashboard/hashtags", search: { prefillCaption: fullText } as any });
    toast.success("Flowing copy to Hashtag Intelligence!");
  };

  const flowToConverter = () => {
    if (!caption) return;
    const fullText = `${caption.hook}\n\n${caption.body}\n\n${caption.cta}`;
    navigate({ to: "/dashboard/converter", search: { prefillCaption: fullText } as any });
    toast.success("Flowing copy to Platform Converter!");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Agent Intro */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" /> Caption Studio Agent
          </h2>
          <p className="text-sm text-muted-foreground">Applies copywriter frameworks and structures hooks, body, and action requests</p>
        </div>
        <div className="text-xs font-mono bg-surface/50 border border-border/40 px-3 py-1.5 rounded-lg text-muted-foreground">
          Cost: <span className="text-accent-warm font-bold">1 credit</span> / generation
        </div>
      </div>

      {/* Input Panel */}
      <form onSubmit={handleGenerate} className="glass rounded-3xl p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Focus Idea or Topic</Label>
            <Input
              id="title"
              placeholder="e.g. The 3-Step Automation method"
              value={ideaTitle}
              onChange={(e) => setIdeaTitle(e.target.value)}
              className="bg-background/40"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hook" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Optional Hook Concept</Label>
            <Input
              id="hook"
              placeholder="e.g. Stop starting from scratch. Clone this..."
              value={hookHint}
              onChange={(e) => setHookHint(e.target.value)}
              className="bg-background/40"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Select Voice Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="bg-background/40">
                <SelectValue placeholder="Tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">Casual & Conversational</SelectItem>
                <SelectItem value="professional">Professional & Authoritative</SelectItem>
                <SelectItem value="witty">Witty & Energetic</SelectItem>
                <SelectItem value="bold">Bold & Direct</SelectItem>
                <SelectItem value="educational">Educational & Instructive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Target Network Format</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="bg-background/40">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="x">X (Twitter)</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="threads">Threads</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button type="submit" variant="hero" className="w-full py-6 text-sm" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Drafting caption...
                </>
              ) : (
                <>
                  Generate Social Caption <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 py-6">
          <div className="h-10 w-full rounded-xl bg-surface/30 animate-pulse" />
          <div className="h-32 w-full rounded-xl bg-surface/30 animate-pulse" />
        </div>
      )}

      {/* Results View */}
      {caption && !loading && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Caption Card */}
          <div className="glass rounded-3xl p-6 md:col-span-2 space-y-5">
            <div className="flex items-center justify-between border-b border-border/20 pb-3">
              <div>
                <span className="text-[10px] font-mono text-primary uppercase capitalize">{caption.platform} · {caption.tone}</span>
                <h3 className="font-display font-bold text-base">Generated Copywriting Output</h3>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-8 w-8 hover:bg-surface" title="Copy to clipboard">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>

            <div className="space-y-4 font-sans text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap select-text selection:bg-primary/30">
              <span className="block font-bold text-foreground text-base border-l-2 border-primary/50 pl-3 py-1 bg-surface/20 rounded-r-lg">
                {caption.hook}
              </span>
              <p>{caption.body}</p>
              <span className="block border-t border-dashed border-border/40 pt-3 text-primary font-semibold">
                {caption.cta}
              </span>
            </div>

            <div className="flex gap-3 border-t border-border/20 pt-4">
              <Button onClick={flowToHashtags} variant="glass" className="flex-1 text-xs gap-1.5">
                <Hash className="h-4 w-4" /> Get Hashtags
              </Button>
              <Button onClick={flowToConverter} variant="glass" className="flex-1 text-xs gap-1.5">
                <Layers className="h-4 w-4" /> Convert Platforms
              </Button>
            </div>
          </div>

          {/* Scheduler Side Panel */}
          <div className="glass rounded-3xl p-6 space-y-4 md:col-span-1">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-4.5 w-4.5 text-accent-warm" /> Schedule Post
            </h3>
            <p className="text-xs text-muted-foreground leading-normal">
              Set a date and time to place this post directly on your publishing schedule.
            </p>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="sched-date" className="text-[10px] font-mono uppercase text-muted-foreground">Select Date & Time</Label>
                <Input
                  id="sched-date"
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="bg-background/40 text-xs"
                />
              </div>

              <Button
                onClick={handleSchedule}
                disabled={scheduling || !scheduleDate}
                className="w-full bg-gradient-to-r from-primary to-accent-warm text-primary-foreground font-semibold text-xs py-5"
              >
                {scheduling ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Schedule Slot"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

