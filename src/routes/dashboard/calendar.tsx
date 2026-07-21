import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getClientSession } from "@/lib/auth";
import { getCalendarEventsAction, saveCalendarEventAction, deleteCalendarEventAction, getWorkspaceItemsAction, generateAICalendarAction } from "@/lib/server-actions.server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, ArrowLeft, ArrowRight, Trash2, Plus, CalendarDays, Check, Globe, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/calendar")({
  component: ContentCalendar,
});

function ContentCalendar() {
  const user = getClientSession();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Month navigation state
  const [currentDate, setCurrentDate] = useState(new Date());

  // Create Event Form State
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [schedulingAI, setSchedulingAI] = useState(false);

  const handleGenerateAICalendar = async () => {
    if (!user) return;
    setSchedulingAI(true);
    try {
      const res = await generateAICalendarAction({ data: { userId: user.id } });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Success! Generated weekly plan: "${res.planTitle}". Scheduled ${res.count} posts.`);
        // Deduct client-side credits
        user.credits = Math.max(0, user.credits - 5);
        loadEvents();
      }
    } catch (e) {
      toast.error("Failed to generate AI weekly content plan");
    } finally {
      setSchedulingAI(false);
    }
  };

  // Detail Modal State
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const loadEvents = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await getCalendarEventsAction({ data: { userId: user.id } });
      setEvents(res);
    } catch (e) {
      toast.error("Failed to load calendar schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !content || platforms.length === 0 || !scheduledAt) {
      toast.warning("Please fill out all calendar scheduling fields");
      return;
    }
    setSubmitting(true);
    try {
      await saveCalendarEventAction({
        data: {
          userId: user.id,
          title,
          content,
          platforms: platforms.join(","),
          scheduledAt: new Date(scheduledAt).toISOString(),
          status: "SCHEDULED"
        }
      });
      toast.success("Social post slot scheduled successfully!");
      setTitle("");
      setContent("");
      setPlatforms([]);
      setScheduledAt("");
      setCreating(false);
      loadEvents();
    } catch (e) {
      toast.error("Failed to schedule custom post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to unschedule this post?")) return;
    try {
      await deleteCalendarEventAction({ data: { id } });
      toast.success("Post unscheduled from calendar");
      setEvents(events.filter((e) => e.id !== id));
      setSelectedEvent(null);
    } catch (e) {
      toast.error("Failed to delete event");
    }
  };

  // Generate calendar grid days
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const leadingBlanks = Array.from({ length: firstDayIndex }, (_, i) => null);
  const calendarCells = [...leadingBlanks, ...daysArray];

  // Helper to filter events by date
  const getEventsForDay = (day: number) => {
    return events.filter((e) => {
      const eDate = new Date(e.scheduledAt);
      return (
        eDate.getDate() === day &&
        eDate.getMonth() === month &&
        eDate.getFullYear() === year
      );
    });
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePlatformToggle = (plat: string) => {
    if (platforms.includes(plat)) {
      setPlatforms(platforms.filter((p) => p !== plat));
    } else {
      setPlatforms([...platforms, plat]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header Control */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="glass" size="icon" onClick={handlePrevMonth}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-display text-xl font-bold text-foreground min-w-[150px] text-center">
            {monthNames[month]} {year}
          </h2>
          <Button variant="glass" size="icon" onClick={handleNextMonth}>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleGenerateAICalendar} variant="glass" size="sm" className="border-primary/20 text-primary hover:bg-primary/10 gap-1.5" disabled={schedulingAI}>
            {schedulingAI ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Scheduling...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-primary fill-primary/10" /> AI Weekly Plan Generator
              </>
            )}
          </Button>
          <Button onClick={() => setCreating(!creating)} variant="hero" size="sm">
            <Plus className="mr-1.5 h-4 w-4" /> Schedule Custom Post
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar Grid */}
        <div className="glass rounded-3xl p-5 lg:col-span-3 space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs text-muted-foreground uppercase border-b border-border/20 pb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {loading ? (
            <div className="grid grid-cols-7 gap-2 min-h-[400px]">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-surface/30 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((day, idx) => {
                if (day === null) {
                  return <div key={`blank-${idx}`} className="h-24 rounded-2xl bg-surface/5 opacity-20 border border-transparent" />;
                }
                const dayEvents = getEventsForDay(day);
                const isToday =
                  new Date().getDate() === day &&
                  new Date().getMonth() === month &&
                  new Date().getFullYear() === year;

                return (
                  <div
                    key={`day-${day}`}
                    className={`h-24 rounded-2xl p-2 border flex flex-col justify-between overflow-hidden transition-all ${
                      isToday
                        ? "border-primary bg-primary/5 glow-primary"
                        : "border-border/30 bg-surface/30 hover:border-border/80"
                    }`}
                  >
                    <span className={`text-[10px] font-mono font-bold ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                      {day}
                    </span>
                    <div className="flex-1 overflow-y-auto space-y-1 mt-1 pr-1 scrollbar-thin">
                      {dayEvents.map((e) => (
                        <div
                          key={e.id}
                          onClick={() => setSelectedEvent(e)}
                          className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-primary/20 border border-primary/30 text-foreground truncate cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                          {e.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Side Panel: Scheduled Queue */}
        <div className="glass rounded-3xl p-5 lg:col-span-1 flex flex-col justify-between h-[450px]">
          <div>
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b border-border/20 pb-2">
              <CalendarDays className="h-4.5 w-4.5 text-primary" /> Upcoming Queue
            </h3>
            <div className="overflow-y-auto max-h-[350px] space-y-2 mt-4 pr-1">
              {loading ? (
                <div className="h-10 w-full rounded-xl bg-surface/30 animate-pulse" />
              ) : events.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No scheduled posts. Try creating some above!</p>
              ) : (
                events.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => setSelectedEvent(e)}
                    className="p-3 rounded-xl border border-border/20 bg-surface/30 hover:border-primary/40 transition-all cursor-pointer flex justify-between items-center gap-2"
                  >
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono text-accent-warm block">
                        {new Date(e.scheduledAt).toLocaleDateString()}
                      </span>
                      <h4 className="text-xs font-semibold text-foreground truncate">{e.title}</h4>
                    </div>
                    <span className="text-[8px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded capitalize">
                      {e.platforms.split(",")[0]}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <form onSubmit={handleCreateEvent} className="w-full max-w-lg glass rounded-3xl p-6 border border-border/40 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/20 pb-3">
              <h3 className="font-display font-bold text-base flex items-center gap-1.5"><Calendar className="h-5 w-5 text-primary" /> Schedule New Social Post</h3>
              <Button type="button" variant="ghost" size="icon" onClick={() => setCreating(false)} className="h-8 w-8">&times;</Button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="post-title" className="text-xs text-muted-foreground font-mono">Post Title</Label>
                <Input id="post-title" placeholder="e.g. Workflow Announcement" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="post-content" className="text-xs text-muted-foreground font-mono">Post Content (Copy)</Label>
                <Textarea id="post-content" placeholder="Write full caption body here..." value={content} onChange={(e) => setContent(e.target.value)} className="min-h-20" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="post-date" className="text-xs text-muted-foreground font-mono">Publish Date & Time</Label>
                  <Input id="post-date" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground font-mono block">Publish Networks</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["linkedin", "x", "instagram", "facebook"].map((plat) => {
                      const selected = platforms.includes(plat);
                      return (
                        <button
                          key={plat}
                          type="button"
                          onClick={() => handlePlatformToggle(plat)}
                          className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                            selected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-border/30 bg-surface/50 text-muted-foreground"
                          }`}
                        >
                          {plat.toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border/20">
              <Button type="button" variant="glass" onClick={() => setCreating(false)}>Cancel</Button>
              <Button type="submit" variant="hero" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Slot"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Event Details Expanded View */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass rounded-3xl p-6 border border-border/40 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/20 pb-3">
              <div>
                <span className="text-[10px] font-mono text-accent-warm uppercase flex items-center gap-1"><Globe className="h-3 w-3" /> Publish: {selectedEvent.platforms.toUpperCase()}</span>
                <h3 className="font-display font-bold text-base">{selectedEvent.title}</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedEvent(null)} className="h-8 w-8">&times;</Button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-background/40 border border-border/20 text-sm whitespace-pre-wrap select-text">
                {selectedEvent.content.includes("<img") ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedEvent.content }} />
                ) : (
                  selectedEvent.content
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                Scheduled publish date: {new Date(selectedEvent.scheduledAt).toLocaleString()}
              </p>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border/20">
              <Button variant="ghost" className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteEvent(selectedEvent.id)}>
                <Trash2 className="mr-1 h-4 w-4" /> Unschedule Slot
              </Button>
              <Button onClick={() => setSelectedEvent(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

