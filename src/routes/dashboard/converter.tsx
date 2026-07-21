import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getClientSession, setClientSession } from "@/lib/auth";
import { runPlatformConverter, saveCalendarEventAction } from "@/lib/server-actions.server";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, ArrowRight, Loader2, Copy, Check, Calendar, MessageSquare, AtSign, Briefcase, Camera } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/converter")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      prefillCaption: (search.prefillCaption as string) || "",
    };
  },
  component: ConverterAgent,
});

function ConverterAgent() {
  const user = getClientSession();
  const { prefillCaption } = Route.useSearch();

  const [originalText, setOriginalText] = useState("");
  const [loading, setLoading] = useState(false);
  const [converted, setConverted] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Scheduling State
  const [schedulingKey, setSchedulingKey] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");

  useEffect(() => {
    if (prefillCaption) {
      setOriginalText(prefillCaption);
    }
  }, [prefillCaption]);

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !originalText) return;
    setLoading(true);
    try {
      const res = await runPlatformConverter({ data: { userId: user.id, originalText } });
      if (res.error) {
        toast.error(res.error);
      } else {
        setConverted(res);
        toast.success("Content adapted across all networks! Saved to workspace.");
        user.credits = Math.max(0, user.credits - 1);
        setClientSession(user);
      }
    } catch (e) {
      toast.error("Failed to convert platforms");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied tailored ${key.toUpperCase()} post!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const schedulePost = async (key: string, content: string) => {
    if (!user || !scheduleDate) return;
    setSchedulingKey(key);
    try {
      await saveCalendarEventAction({
        data: {
          userId: user.id,
          title: `Post (${key.toUpperCase()}): ${originalText.substring(0, 20)}...`,
          content,
          platforms: key,
          scheduledAt: new Date(scheduleDate).toISOString(),
          status: "SCHEDULED"
        }
      });
      toast.success(`Scheduled ${key.toUpperCase()} post successfully!`);
      setScheduleDate("");
    } catch (e) {
      toast.error(`Failed to schedule ${key.toUpperCase()} post`);
    } finally {
      setSchedulingKey(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Agent Intro */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" /> Platform Converter Agent
          </h2>
          <p className="text-sm text-muted-foreground">Reformulates single-source captions into network-native formatting, tone, and character counts</p>
        </div>
        <div className="text-xs font-mono bg-surface/50 border border-border/40 px-3 py-1.5 rounded-lg text-muted-foreground">
          Cost: <span className="text-accent-warm font-bold">1 credit</span> / conversion
        </div>
      </div>

      {/* Input Panel */}
      <form onSubmit={handleConvert} className="glass rounded-3xl p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sourceText" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Source Social Caption or Article Snipping</Label>
          <Textarea
            id="sourceText"
            placeholder="Paste your base caption here. The agent will adapt it into specific shapes for Twitter, LinkedIn, Instagram, and Threads..."
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            className="bg-background/40 min-h-28 resize-none"
            required
          />
        </div>

        <Button type="submit" variant="hero" className="w-full py-6 text-sm" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adapting hooks & structuring tags...
            </>
          ) : (
            <>
              Convert Post Across Platforms <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 py-6">
          <div className="h-10 w-full rounded-xl bg-surface/30 animate-pulse" />
          <div className="h-44 w-full rounded-xl bg-surface/30 animate-pulse" />
        </div>
      )}

      {/* Results View */}
      {converted && !loading && (
        <div className="glass rounded-3xl p-6 space-y-6">
          <div>
            <span className="text-[10px] font-mono text-primary uppercase">Converted Formats</span>
            <h3 className="font-display font-bold text-lg">Native Network Outputs</h3>
          </div>

          <Tabs defaultValue="linkedin" className="w-full">
            <TabsList className="bg-background/80 border border-border/40 p-1 rounded-xl">
              <TabsTrigger value="linkedin" className="rounded-lg text-xs gap-1.5"><Briefcase className="h-3.5 w-3.5" /> LinkedIn</TabsTrigger>
              <TabsTrigger value="x" className="rounded-lg text-xs gap-1.5"><AtSign className="h-3.5 w-3.5" /> X (Twitter)</TabsTrigger>
              <TabsTrigger value="instagram" className="rounded-lg text-xs gap-1.5"><Camera className="h-3.5 w-3.5" /> Instagram</TabsTrigger>
              <TabsTrigger value="threads" className="rounded-lg text-xs gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Threads</TabsTrigger>
            </TabsList>

            {[
              { key: "linkedin", label: "LinkedIn", content: converted.linkedin, icon: Briefcase },
              { key: "x", label: "X (Twitter)", content: converted.x, icon: AtSign },
              { key: "instagram", label: "Instagram", content: converted.instagram, icon: Camera },
              { key: "threads", label: "Threads", content: converted.threads, icon: MessageSquare }
            ].map((tab) => (
              <TabsContent key={tab.key} value={tab.key} className="mt-4 grid gap-6 md:grid-cols-3">
                {/* Content Output */}
                <div className="md:col-span-2 space-y-4 rounded-2xl border border-border/40 bg-surface/30 p-5">
                  <div className="flex items-center justify-between border-b border-border/20 pb-3">
                    <span className="text-xs font-semibold flex items-center gap-1.5"><tab.icon className="h-4 w-4" /> tailored Copy</span>
                    <Button variant="ghost" size="sm" onClick={() => copyText(tab.key, tab.content)} className="h-8 text-xs gap-1">
                      {copiedKey === tab.key ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />} Copy Copy
                    </Button>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap select-text">{tab.content}</p>
                </div>

                {/* Date Scheduler Card */}
                <div className="md:col-span-1 rounded-2xl border border-border/40 bg-surface/30 p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold flex items-center gap-1.5"><Calendar className="h-4 w-4 text-accent-warm" /> Schedule adapted post</span>
                    <p className="text-[10px] text-muted-foreground leading-normal">Schedule this specific formatting variation directly.</p>
                  </div>
                  <div className="space-y-3 mt-4">
                    <div className="space-y-1">
                      <Label htmlFor={`date-${tab.key}`} className="text-[9px] font-mono uppercase text-muted-foreground">Select Schedule Date</Label>
                      <Input
                        id={`date-${tab.key}`}
                        type="datetime-local"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="bg-background/40 text-xs"
                      />
                    </div>
                    <Button
                      onClick={() => schedulePost(tab.key, tab.content)}
                      disabled={schedulingKey !== null || !scheduleDate}
                      className="w-full text-xs font-semibold py-5 bg-gradient-to-r from-primary to-accent-warm text-primary-foreground border-none"
                    >
                      {schedulingKey === tab.key ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : "Confirm Slot"}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
}

