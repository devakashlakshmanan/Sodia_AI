import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getClientSession, setClientSession } from "@/lib/auth";
import { updateBrandVoiceAction, saveUser } from "@/lib/server-actions.server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Settings, Save, Sparkles, User, Shield, Key } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfileSettings,
});

function ProfileSettings() {
  const user = getClientSession();
  const [name, setName] = useState(user?.fullName || "");
  const [brandVoice, setBrandVoice] = useState(user?.brandVoice || "");
  const [savingVoice, setSavingVoice] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name) return;
    setSavingProfile(true);
    try {
      const updatedUser = { ...user, fullName: name };
      await saveUser({ data: updatedUser });
      setClientSession(updatedUser);
      toast.success("Profile details updated successfully!");
    } catch (e) {
      toast.error("Failed to save profile details");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveVoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingVoice(true);
    try {
      const res = await updateBrandVoiceAction({ data: { userId: user.id, brandVoice } });
      if (res.error) {
        toast.error(res.error);
      } else {
        const updatedUser = { ...user, brandVoice };
        setClientSession(updatedUser);
        toast.success("Brand Voice rules updated! All AI agents will now respect these settings.");
      }
    } catch (e) {
      toast.error("Failed to save brand voice presets");
    } finally {
      setSavingVoice(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" /> Profile & Brand Settings
        </h2>
        <p className="text-sm text-muted-foreground font-sans">Configure your social voice parameters and manage your account details</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Brand Voice presets */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSaveVoice} className="glass rounded-3xl p-6 space-y-4">
            <div>
              <h3 className="font-display font-bold text-base flex items-center gap-1.5"><Sparkles className="h-4.5 w-4.5 text-primary" /> Core Brand Voice Rules</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Describe your tone guidelines, vocabulary exclusions, or formatting styles.</p>
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="e.g. Conversational, educational, and direct. Avoid generic adjectives. End posts with a single call to action..."
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
                className="min-h-36 bg-background/40 font-sans text-sm resize-none leading-relaxed"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="hero" disabled={savingVoice}>
                <Save className="mr-1.5 h-4 w-4" /> Save Brand Voice
              </Button>
            </div>
          </form>
        </div>

        {/* Right Side: Account metadata & Settings */}
        <div className="md:col-span-1 space-y-6">
          {/* Details Card */}
          <form onSubmit={handleSaveProfile} className="glass rounded-3xl p-5 space-y-4">
            <div>
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><User className="h-4 w-4" /> Account Details</h3>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="prof-name" className="text-[10px] font-mono text-muted-foreground uppercase">Full Name</Label>
                <Input
                  id="prof-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background/40 text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-mono text-muted-foreground uppercase">Email Address</Label>
                <Input
                  value={user?.email}
                  className="bg-background/20 text-xs opacity-60 border-border/20 cursor-not-allowed"
                  disabled
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-mono text-muted-foreground uppercase">Security Role</Label>
                <div className="flex items-center gap-1.5 rounded-lg border border-border/20 bg-surface/30 px-3 py-2 text-xs text-muted-foreground font-mono select-none">
                  <Shield className="h-3.5 w-3.5" />
                  <span>{user?.role}</span>
                </div>
              </div>
            </div>
            <Button type="submit" variant="glass" className="w-full mt-4 text-xs font-semibold py-4" disabled={savingProfile}>
              Update Profile Details
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

