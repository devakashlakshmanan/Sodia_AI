import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { SodiaLogo } from "@/components/SodiaLogo";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
});

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    // Mock send delay
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      toast.success("Password reset link sent to your email!");
    }, 1200);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-30" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />

      <div className="w-full max-w-md glass rounded-3xl p-8 glow-primary">
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="flex items-center mb-6">
            <SodiaLogo size={44} showText={true} />
          </Link>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Reset password</h2>
          <p className="mt-2 text-sm text-muted-foreground">We will send you a secure link to reset your access</p>
        </div>

        {sent ? (
          <div className="mt-8 space-y-6 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-6 w-6" />
            </div>
            <p className="text-sm text-foreground/90">
              Check your inbox at <span className="font-semibold">{email}</span> and follow the instructions to reset your password.
            </p>
            <Link to="/login" className="block text-xs font-semibold text-primary hover:underline">
              Back to Sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="mt-8 space-y-4">
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
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Link"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="mt-6 text-center text-xs">
              <Link to="/login" className="text-muted-foreground hover:text-foreground hover:underline">
                Back to Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
