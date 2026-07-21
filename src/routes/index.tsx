import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Brain, TrendingUp, Hash, Calendar, Image as ImageIcon,
  MessageSquare, BarChart3, Layers, Workflow, Check, ArrowRight,
  Zap, Globe, Bot, Lightbulb, Shield, Star, Sparkles, Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SodiaLogo } from "@/components/SodiaLogo";
import heroImg from "@/assets/hero-network.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sodia AI — Your Multi-Agent Social Media Creator" },
      { name: "description", content: "Sodia AI orchestrates 9 specialised AI agents to research trends, generate ideas, craft captions, design visuals, and schedule your entire social calendar." },
      { property: "og:title", content: "Sodia AI — Your Multi-Agent Social Media Creator" },
      { property: "og:description", content: "9 collaborating AI agents that run your entire social workflow — from trends to publishing." },
    ],
  }),
  component: Landing,
});

const agents = [
  { icon: TrendingUp, name: "Trend Analysis", desc: "Tracks Google Trends + breaking news to surface what's about to pop." },
  { icon: Brain, name: "Content Research", desc: "Gathers context, competitors and audience signals for every campaign." },
  { icon: Lightbulb, name: "Content Idea", desc: "Generates post, reel, story and carousel ideas tuned to your goals." },
  { icon: MessageSquare, name: "Caption Studio", desc: "Writes hooks, body and CTAs in your tone — for every platform." },
  { icon: Hash, name: "Hashtag Intelligence", desc: "Mixes trending, niche and low-comp hashtags with reach scores." },
  { icon: Layers, name: "Platform Converter", desc: "Reshapes one idea into Instagram, LinkedIn, X, Threads and more." },
  { icon: ImageIcon, name: "AI Image Studio", desc: "Generates on-brand visuals, banners and reel covers in seconds." },
  { icon: Calendar, name: "Content Calendar", desc: "Auto-builds a complete posting schedule across all channels." },
  { icon: BarChart3, name: "Engagement Prediction", desc: "Scores virality, reach and audience fit before you publish." },
];

const workflow = [
  { step: "01", title: "Discover", text: "Trend & Research agents scan the web." },
  { step: "02", title: "Ideate", text: "Idea agent proposes campaign-ready concepts." },
  { step: "03", title: "Create", text: "Caption, Hashtag & Image agents build the asset." },
  { step: "04", title: "Adapt", text: "Platform Converter tailors it to each channel." },
  { step: "05", title: "Schedule", text: "Calendar agent slots it into your week." },
  { step: "06", title: "Predict", text: "Engagement agent scores it before publishing." },
];

const benefits = [
  { icon: Zap, title: "10× faster", text: "What used to take a week now takes an afternoon." },
  { icon: Globe, title: "Every platform", text: "Instagram, LinkedIn, X, Threads, Facebook, YouTube." },
  { icon: Shield, title: "On-brand always", text: "Tone, style and audience presets per workspace." },
  { icon: Bot, title: "9 agents, 1 brain", text: "Outputs flow between agents automatically." },
];

const statHighlights = [
  { label: "Active workspaces", value: "4.8k+" },
  { label: "Time saved weekly", value: "8.2 hrs" },
  { label: "Content shipped", value: "12k+" },
];

const testimonials = [
  { name: "Aanya Mehta", role: "Founder, Lumen Studio", quote: "Sodia replaced three freelancers. The calendar agent alone saves my Mondays." },
  { name: "Marcus Reyes", role: "Head of Growth, Northbeam", quote: "Trend → caption → image in one flow. Engagement is up 47% this quarter." },
  { name: "Priya Shah", role: "Creator (480k)", quote: "I write one prompt, get a week of content. The hashtag scoring is uncannily accurate." },
];

const pricing = [
  { name: "Free Creator", price: "Rs.0", desc: "Try every agent.", features: ["50 generations / mo", "3 saved calendars", "Watermarked images", "Community support"], cta: "Start free" },
  { name: "Pro Orchestrator", price: "Rs.299", desc: "For serious creators.", features: ["Unlimited generations", "All 9 agents", "HD image exports", "Trend reports + alerts", "Priority queue"], cta: "Go Pro", featured: true },
  { name: "Enterprise Studio", price: "Rs.499", desc: "Teams & agencies.", features: ["Multi-workspace", "Brand voice training", "API access", "SSO + audit logs", "Dedicated success"], cta: "Talk to sales" },
];

const faqs = [
  { q: "What makes Sodia different from ChatGPT?", a: "Sodia isn't one model — it's nine specialised agents that hand off context to each other. Each is tuned for its job (trends, captions, visuals, scheduling) and they collaborate automatically." },
  { q: "Which platforms are supported?", a: "Instagram, LinkedIn, Facebook, X (Twitter), Threads, and YouTube Community — with format, length and tone adapted per platform." },
  { q: "Do I need to connect my accounts?", a: "No. Sodia generates everything you need — you choose when to publish. Direct publishing connectors are on the Pro roadmap." },
  { q: "How does engagement prediction work?", a: "The Engagement agent scores your caption, hashtags and timing against platform-specific signals and surfaces concrete improvements before you post." },
  { q: "Can I train it on my brand voice?", a: "Yes — Pro and Enterprise workspaces include brand voice presets so every agent writes in your tone." },
];

function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-6 pt-5">
        <div className="glass flex items-center justify-between rounded-2xl px-5 py-3">
          <Link to="/" className="flex items-center">
            <SodiaLogo size={38} showText={true} />
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#agents" className="hover:text-foreground transition-colors">Agents</a>
            <a href="#workflow" className="hover:text-foreground transition-colors">Workflow</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button variant="hero" size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-24">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{ backgroundImage: `url(${heroImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      <div className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-30" />

      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-warm opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-accent-warm" /></span>
            9 collaborating AI agents · Powered by Gemini
          </div>

          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Your entire social team,<br />
            <span className="text-gradient">re-imagined as AI agents.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Sodia AI orchestrates nine specialised agents that research trends, generate ideas,
            craft captions, design visuals and schedule your content calendar — together.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/signup">
              <Button variant="hero" size="xl">Start creating free <ArrowRight className="h-4 w-4" /></Button>
            </Link>
            <Button variant="glass" size="xl">
              <Play className="h-4 w-4" /> Watch the workflow
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {statHighlights.map((item) => (
              <div key={item.label} className="rounded-full border border-border/70 bg-background/70 px-3 py-2 text-sm text-muted-foreground backdrop-blur">
                <span className="mr-2 font-semibold text-foreground">{item.value}</span>
                {item.label}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3 }}
          className="relative mx-auto mt-16 max-w-6xl"
        >
          <div className="hero-shell soft-ring rounded-[32px] p-3 sm:p-4">
            <div className="rounded-[24px] border border-border/70 bg-background/80 p-4 sm:p-6 backdrop-blur">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                    <Sparkles className="h-3.5 w-3.5" /> Live workspace preview
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground">
                    One prompt, a full launch week.
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Trend signals, captions, visuals and publishing plans all flow together from one workspace.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Ready to publish
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-border/70 bg-surface/70 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Workflow snapshot</p>
                      <p className="mt-1 font-display text-lg font-semibold">This week’s campaign stack</p>
                    </div>
                    <div className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">3 assets ready</div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      { title: "Trend pulse", detail: "AI trend analysis surfaced 6 rising topics" },
                      { title: "Caption draft", detail: "3 platform variants with stronger hooks" },
                      { title: "Visual concept", detail: "Reel cover and story frame generated" },
                    ].map((item) => (
                      <div key={item.title} className="rounded-xl border border-border/60 bg-background/70 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.detail}</p>
                          </div>
                          <div className="rounded-full bg-accent-warm/20 p-2 text-accent-warm">
                            <Sparkles className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-surface/70 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Agent performance</p>
                      <p className="mt-1 font-display text-lg font-semibold">Engagement forecast</p>
                    </div>
                    <div className="text-2xl font-semibold text-foreground">89%</div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      { label: "Hook strength", value: "92%" },
                      { label: "Hashtag fit", value: "86%" },
                      { label: "Timing quality", value: "91%" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border border-border/60 bg-background/70 p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-semibold text-foreground">{item.value}</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-surface">
                          <div className="h-2 rounded-full bg-gradient-to-r from-primary to-accent-warm" style={{ width: item.value }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-9">
                {agents.map((a, i) => (
                  <motion.div
                    key={a.name}
                    initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.06, type: "spring", stiffness: 200 }}
                    className="group flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-surface/60 p-3 transition-colors hover:border-primary/40"
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary/30 to-accent-warm/20 text-primary">
                      <a.icon className="h-4 w-4" />
                    </div>
                    <span className="text-center text-[10px] font-medium leading-tight text-muted-foreground group-hover:text-foreground">{a.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Section({ id, eyebrow, title, sub, children }: { id?: string; eyebrow: string; title: React.ReactNode; sub?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</div>
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
          {sub && <p className="mt-4 text-lg text-muted-foreground">{sub}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

function Features() {
  return (
    <Section id="features" eyebrow="What it does"
      title={<>One platform. <span className="text-gradient">Every step</span> of the workflow.</>}
      sub="From the first spark of a trend to a scheduled, scored post — Sodia handles the entire pipeline."
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b) => (
          <div key={b.title} className="glass rounded-2xl p-6 transition-transform hover:-translate-y-1">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/30 to-accent-warm/20 text-primary">
              <b.icon className="h-5 w-5" />
            </div>
            <div className="font-display text-lg font-semibold">{b.title}</div>
            <p className="mt-2 text-sm text-muted-foreground">{b.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Agents() {
  return (
    <Section id="agents" eyebrow="Multi-agent architecture"
      title={<>Nine specialists.<br />One <span className="text-gradient">orchestrated brain.</span></>}
      sub="Each agent owns a discipline. They share context, hand off outputs, and never duplicate work."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((a, i) => (
          <motion.div
            key={a.name}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-surface/60 p-6 transition-all hover:border-primary/50 hover:bg-surface"
          >
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/30 to-accent-warm/20 text-primary">
                  <a.icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Agent / {String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="font-display text-xl font-semibold">{a.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function WorkflowSection() {
  return (
    <Section id="workflow" eyebrow="The flow"
      title={<>From spark to <span className="text-gradient">scheduled post</span></>}
      sub="Trend → idea → caption → image → schedule → predict. The agents pass context automatically."
    >
      <div className="relative">
        <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-border to-transparent md:block" />
        <div className="grid gap-6 md:grid-cols-2">
          {workflow.map((w, i) => (
            <motion.div
              key={w.step}
              initial={{ opacity: 0, x: i % 2 ? 30 : -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={`glass rounded-2xl p-6 ${i % 2 ? "md:translate-y-10" : ""}`}
            >
              <div className="flex items-start gap-4">
                <div className="font-display text-3xl font-bold text-gradient">{w.step}</div>
                <div>
                  <h3 className="font-display text-lg font-semibold">{w.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{w.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Testimonials() {
  return (
    <Section eyebrow="Loved by creators"
      title={<>Teams ship <span className="text-gradient">10× more</span> with Sodia</>}
    >
      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map((t) => (
          <div key={t.name} className="glass flex flex-col gap-4 rounded-2xl p-6">
            <div className="flex gap-0.5 text-accent-warm">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
            </div>
            <p className="text-foreground">"{t.quote}"</p>
            <div className="mt-auto">
              <div className="font-semibold">{t.name}</div>
              <div className="text-xs text-muted-foreground">{t.role}</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Pricing() {
  return (
    <Section id="pricing" eyebrow="Pricing"
      title={<>Start free. <span className="text-gradient">Scale when ready.</span></>}
      sub="Every plan includes all nine agents. Upgrade for more volume and brand controls."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {pricing.map((p) => (
          <div key={p.name}
            className={`relative flex flex-col rounded-2xl border p-7 ${p.featured ? "border-primary/60 bg-gradient-to-b from-primary/10 to-transparent glow-primary" : "border-border bg-surface/50"}`}
          >
            {p.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-accent-warm px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">Most popular</div>
            )}
            <div className="font-display text-lg font-semibold">{p.name}</div>
            <div className="mt-2 text-sm text-muted-foreground">{p.desc}</div>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="font-display text-5xl font-semibold">{p.price}</span>
              {p.price !== "Custom" && <span className="text-sm text-muted-foreground">/mo</span>}
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup" className="mt-8 w-full">
              <Button variant={p.featured ? "hero" : "glass"} size="lg" className="w-full">{p.cta}</Button>
            </Link>
          </div>
        ))}
      </div>
    </Section>
  );
}

function FAQ() {
  return (
    <Section id="faq" eyebrow="FAQ" title={<>Questions, <span className="text-gradient">answered.</span></>}>
      <div className="mx-auto max-w-3xl space-y-3">
        {faqs.map((f, i) => (
          <details key={i} className="group glass rounded-xl p-5 transition-all open:bg-surface">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <span className="font-medium">{f.q}</span>
              <span className="grid h-7 w-7 place-items-center rounded-full border border-border text-muted-foreground transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

function CTA() {
  return (
    <section className="px-6 pb-24">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-surface to-accent-warm/10 p-12 text-center glow-primary">
        <Workflow className="mx-auto mb-5 h-10 w-10 text-primary" />
        <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Stop posting. <span className="text-gradient">Start orchestrating.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Join thousands of creators letting AI agents run the busywork — while they focus on strategy.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/signup">
            <Button variant="hero" size="xl">Create your free workspace <ArrowRight className="h-4 w-4" /></Button>
          </Link>
          <Button variant="glass" size="xl">Book a demo</Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <div className="flex items-center">
          <SodiaLogo size={28} showText={true} />
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Sodia AI · Built with multi-agent intelligence.</p>
        <div className="flex gap-5 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <Features />
        <Agents />
        <WorkflowSection />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
