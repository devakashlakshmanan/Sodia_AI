import { createFileRoute, Link, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getClientSession, setClientSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, Brain, Lightbulb, MessageSquare, Hash, Layers,
  Image as ImageIcon, Calendar, Workflow, Star, BarChart3, Settings,
  CreditCard, Shield, LogOut, Menu, X, ChevronRight, Zap
} from "lucide-react";
import { toast } from "sonner";
import { SodiaLogo } from "@/components/SodiaLogo";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const currentUser = getClientSession();
    setUser(currentUser);
    if (!currentUser) {
      toast.error("Please sign in to access the dashboard.");
      navigate({ to: "/login" });
    }
  }, [navigate]);

  useEffect(() => {
    const handleUpdate = () => {
      setUser(getClientSession());
    };
    window.addEventListener("sodia_session_update", handleUpdate);
    return () => window.removeEventListener("sodia_session_update", handleUpdate);
  }, []);

  if (!mounted || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <Zap className="mx-auto h-8 w-8 animate-pulse text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Authenticating session...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    document.cookie = "sodia_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    setClientSession(null);
    toast.success("Successfully logged out");
    navigate({ to: "/" });
  };

  const navItems = [
    { label: "Overview", to: "/dashboard", icon: BarChart3 },
    { type: "header", label: "AI Agents" },
    { label: "Trend Analysis", to: "/dashboard/trends", icon: TrendingUp },
    { label: "Content Research", to: "/dashboard/research", icon: Brain },
    { label: "Content Idea", to: "/dashboard/ideas", icon: Lightbulb },
    { label: "Caption Studio", to: "/dashboard/caption", icon: MessageSquare },
    { label: "Hashtag Intelligence", to: "/dashboard/hashtags", icon: Hash },
    { label: "Platform Converter", to: "/dashboard/converter", icon: Layers },
    { label: "AI Image Studio", to: "/dashboard/image", icon: ImageIcon },
    { label: "Engagement Prediction", to: "/dashboard/prediction", icon: Workflow },
    { type: "header", label: "Workspace" },
    { label: "Content Calendar", to: "/dashboard/calendar", icon: Calendar },
    { label: "Saved Workspace", to: "/dashboard/saved", icon: Star },
    { label: "Analytics Dashboard", to: "/dashboard/analytics", icon: BarChart3 },
    { type: "header", label: "Account" },
    { label: "Profile & Settings", to: "/dashboard/profile", icon: Settings },
    { label: "Subscription & Billing", to: "/dashboard/billing", icon: CreditCard },
  ];

  if (user.role === "ADMIN") {
    navItems.push({ label: "Admin Panel", to: "/dashboard/admin", icon: Shield });
  }

  const isLinkActive = (to: string) => {
    if (to === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/dashboard/";
    }
    return location.pathname.startsWith(to);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/40 bg-sidebar transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:h-screen`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-border/40">
          <Link to="/dashboard" className="flex items-center">
            <SodiaLogo size={34} showText={true} />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item, idx) => {
            if (item.type === "header") {
              return (
                <div key={idx} className="px-3 pt-4 pb-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </div>
              );
            }
            const Icon = item.icon!;
            const active = isLinkActive(item.to!);
            return (
              <Link
                key={idx}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 group ${
                  active
                    ? "bg-primary/15 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-surface hover:text-foreground border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4.5 w-4.5 transition-colors ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`h-3.5 w-3.5 opacity-0 transition-opacity ${active ? "opacity-100" : "group-hover:opacity-40"}`} />
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border/40 bg-surface/30">

          {/* User profile card & logout */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-accent-warm/20 text-xs font-bold text-primary">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">{user.fullName || "User"}</p>
                <p className="truncate text-[10px] text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/40 px-6 bg-surface/10 backdrop-blur">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-display text-lg font-semibold tracking-tight capitalize">
              {location.pathname.split("/").pop() || "Overview"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/dashboard/billing">
              <Button size="sm" className="hidden sm:flex bg-gradient-to-r from-primary to-accent-warm text-primary-foreground font-semibold border-none hover:opacity-90">
                <Zap className="mr-1 h-3.5 w-3.5 fill-current" /> Go Pro
              </Button>
            </Link>
          </div>
        </header>

        {/* Dashboard views */}
        <main className="flex-1 overflow-y-auto p-6 bg-background/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
