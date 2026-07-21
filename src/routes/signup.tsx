import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, Sparkles, ShieldCheck, Workflow } from "lucide-react";
import { signUpAction } from "@/lib/server-actions.server";
import { setClientSession } from "@/lib/auth";
import { toast } from "sonner";
import { SodiaLogo } from "@/components/SodiaLogo";

export const Route = createFileRoute("/signup")({
  component: Signup,
});

function Signup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    setLoading(true);
    try {
      const res = await signUpAction({ data: { email, name } });
      if (res.error) {
        toast.error(res.error);
      } else if (res.user) {
        document.cookie = `sodia_session=${encodeURIComponent(res.user.id)}; path=/; max-age=86400`;
        setClientSession(res.user as any);
        toast.success(`Account created successfully!`);
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error("Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-30" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />

      <div className="auth-shell w-full max-w-6xl overflow-hidden rounded-[32px] border border-border/70">
        <div className="grid lg:grid-cols-[1.02fr_0.98fr]">
          <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary/15 via-background to-accent-warm/10 p-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Launch faster
              </div>
              <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight text-foreground">
                Build a smarter creator workflow from day one.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                Your brand voice, content ideas, calendars and engagement guidance are all shaped together in one place.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { icon: ShieldCheck, text: "Professional-grade workspace for your whole team" },
                { icon: Workflow, text: "Structured agent handoffs that keep content moving" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-3 text-sm text-muted-foreground">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span>{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-background/70 p-8 sm:p-10">
            <div className="flex flex-col items-center text-center">
              <Link to="/" className="flex items-center mb-6">
                <SodiaLogo size={44} showText={true} />
              </Link>
              <h2 className="font-display text-2xl font-semibold tracking-tight">Create your account</h2>
              <p className="mt-2 text-sm text-muted-foreground">Start orchestrating your social agents</p>
            </div>

            <form onSubmit={handleSignup} className="mt-8 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background/40 border-border/80 focus:border-primary/60 focus:ring-primary/40"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/40 border-border/80 focus:border-primary/60 focus:ring-primary/40"
                  required
                />
              </div>

              <Button type="submit" variant="hero" className="w-full py-6 text-sm" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign Up"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

