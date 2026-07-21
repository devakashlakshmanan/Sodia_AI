import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getClientSession, setClientSession } from "@/lib/auth";
import { createCheckoutSessionAction, syncPaymentSuccessAction, cancelSubscriptionAction } from "@/lib/server-actions.server";
import { Button } from "@/components/ui/button";
import { CreditCard, Check, Zap, Loader2, Star, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/billing")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      session_id: (search.session_id as string) || "",
      price_id: (search.price_id as string) || "",
    };
  },
  component: SubscriptionBilling,
});

function SubscriptionBilling() {
  const user = getClientSession();
  const navigate = useNavigate();
  const { session_id, price_id } = Route.useSearch();
  const [loadingPrice, setLoadingPrice] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);

  // Sync payments success parameters on return redirect
  useEffect(() => {
    if (session_id && price_id && user) {
      const syncPayment = async () => {
        try {
          const res = await syncPaymentSuccessAction({ data: { userId: user.id, priceId: price_id } });
          if (res.user) {
            setClientSession(res.user as any);
            toast.success("Upgrade successful! Your credits have been updated.");
            navigate({ to: "/dashboard/billing", replace: true });
          }
        } catch (e) {
          toast.error("Failed to sync subscription details");
        }
      };
      syncPayment();
    }
  }, [session_id, price_id]);

  const handleCheckout = async (priceId: string) => {
    if (!user) return;
    setLoadingPrice(priceId);
    try {
      const res = await createCheckoutSessionAction({ data: { userId: user.id, priceId } });
      if (res.url) {
        toast.info("Redirecting to Stripe Checkout checkout...");
        // In local mock, it goes back here with checkout url parameters
        window.location.href = res.url;
      }
    } catch (e) {
      toast.error("Failed to initiate billing session");
    } finally {
      setLoadingPrice(null);
    }
  };

  const handleCancelSub = async () => {
    if (!user || !confirm("Are you sure you want to cancel your subscription? You will return to the free plan limits.")) return;
    setCanceling(true);
    try {
      const res = await cancelSubscriptionAction({ data: { userId: user.id } });
      if (res.user) {
        setClientSession(res.user as any);
        toast.success("Subscription canceled successfully.");
      }
    } catch (e) {
      toast.error("Failed to cancel subscription");
    } finally {
      setCanceling(false);
    }
  };

  const pricingTiers = [
    {
      id: "price_free",
      name: "Free Creator",
      price: "Rs.0",
      desc: "Perfect for testing agentic outputs.",
      features: ["50 credits / month", "Save up to 10 workspace items", "Standard model queues", "Basic AI Image models"],
      cta: "Current Tier",
      allowed: false
    },
    {
      id: "price_pro",
      name: "Pro Orchestrator",
      price: "Rs.299",
      desc: "For active content builders.",
      features: ["500 credits / month", "Unlimited workspace savings", "Priority agent responses", "Full Content Calendar access", "Premium visual studios"],
      cta: "Go Pro",
      allowed: true,
      featured: true
    },
    {
      id: "price_enterprise",
      name: "Enterprise Studio",
      price: "Rs.499",
      desc: "For agencies and large scale publishers.",
      features: ["9999 credits / month", "Multi-brand voice models", "Dedicated support logs", "Custom API tokens", "Admin oversight controls"],
      cta: "Upgrade Enterprise",
      allowed: true
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" /> Subscriptions & Billing
        </h2>
        <p className="text-sm text-muted-foreground font-sans">Choose the volume model that fits your social growth requirements</p>
      </div>

      {/* Subscription Status Card */}
      <div className="glass rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-primary/20 glow-primary">
        <div>
          <span className="text-[10px] font-mono text-primary uppercase">Active Subscription</span>
          <h3 className="font-display font-bold text-lg mt-0.5">
            {user?.stripePriceId === "price_pro"
              ? "Pro Plan"
              : user?.stripePriceId === "price_enterprise"
              ? "Enterprise Plan"
              : "Free Tier Plan"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Status: <span className="text-green-400 capitalize font-semibold">{user?.stripeStatus || "active"}</span> · Credits reset monthly.
          </p>
        </div>

        {user?.stripePriceId && (
          <Button variant="ghost" className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleCancelSub} disabled={canceling}>
            {canceling ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel Subscription"}
          </Button>
        )}
      </div>

      {/* Plans list */}
      <div className="grid gap-5 md:grid-cols-3 mt-6">
        {pricingTiers.map((tier) => {
          const isActive = user?.stripePriceId === tier.id || (!user?.stripePriceId && tier.id === "price_free");
          return (
            <div
              key={tier.id}
              className={`relative flex flex-col rounded-3xl border p-6 justify-between ${
                tier.featured
                  ? "border-primary/60 bg-gradient-to-b from-primary/10 to-transparent glow-primary"
                  : "border-border/30 bg-surface/40"
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-accent-warm px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                  Best Value
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="font-display font-bold text-base text-foreground">{tier.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-normal">{tier.desc}</p>
                </div>

                <div className="flex items-baseline gap-1 mt-2">
                  <span className="font-display text-4xl font-bold">{tier.price}</span>
                  {tier.price !== "Custom" && <span className="text-xs text-muted-foreground">/mo</span>}
                </div>

                <ul className="space-y-2 mt-4 text-xs">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-1.5 leading-normal">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                {isActive ? (
                  <Button variant="glass" className="w-full flex items-center justify-center gap-1 border-primary/40 bg-primary/5 text-primary text-xs font-semibold py-5 cursor-default" disabled>
                    <CheckCircle className="h-4 w-4" /> Active Plan
                  </Button>
                ) : tier.allowed ? (
                  <Button
                    onClick={() => handleCheckout(tier.id)}
                    disabled={loadingPrice !== null}
                    variant={tier.featured ? "hero" : "glass"}
                    className="w-full text-xs font-semibold py-5"
                  >
                    {loadingPrice === tier.id ? <Loader2 className="h-4 w-4 animate-spin" /> : tier.cta}
                  </Button>
                ) : (
                  <Button variant="glass" className="w-full text-xs font-semibold py-5" disabled>
                    {tier.cta}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

