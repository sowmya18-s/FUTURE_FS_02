import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight, BarChart3, Users, Zap, Shield, CheckCircle2, Sparkles,
  TrendingUp, Mail, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LeadFlow — Beautiful CRM for closing more leads" },
      { name: "description", content: "Capture, track and convert leads with an elegant, lightning-fast CRM built for modern sales teams." },
      { property: "og:title", content: "LeadFlow — Mini CRM" },
      { property: "og:description", content: "Capture, track and convert leads with an elegant, fast CRM." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Users, title: "Lead Pipeline", desc: "Organize prospects across the full funnel with one-click status updates." },
  { icon: BarChart3, title: "Live Analytics", desc: "Dashboards that show conversion rates, sources and team velocity in real-time." },
  { icon: Zap, title: "Built for Speed", desc: "Keyboard-first workflows. Add, edit and qualify leads in seconds." },
  { icon: Shield, title: "Secure by Default", desc: "Row-level security ensures your team only sees what they should." },
  { icon: Mail, title: "Notes & Activity", desc: "Every touchpoint logged automatically. Never lose context again." },
  { icon: TrendingUp, title: "CSV Export", desc: "Take your data anywhere. One-click export of any view or segment." },
];

const benefits = [
  "Unlimited leads and notes",
  "Real-time activity timeline",
  "Source attribution & tagging",
  "Status-based filtering",
  "Mobile, tablet & desktop ready",
  "Bank-level encryption",
];

const testimonials = [
  { name: "Sarah Chen", role: "Head of Sales, Linear", quote: "LeadFlow replaced three tools. Our team closes 40% faster now." },
  { name: "Marcus Reid", role: "Founder, Quill", quote: "The cleanest CRM I've used. Onboarded my whole team in an afternoon." },
  { name: "Priya Patel", role: "RevOps, Atlas", quote: "Finally, a CRM that doesn't feel like a chore. The dashboards alone are worth it." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-elegant">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">LeadFlow</span>
          </Link>
          <nav className="hidden gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
            <a href="#benefits" className="text-sm text-muted-foreground hover:text-foreground">Benefits</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground">Customers</a>
            <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/signup"><Button size="sm" className="bg-gradient-primary text-primary-foreground shadow-elegant">Get started</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Now in early access
            </div>
            <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
              The CRM your team will <span className="text-gradient">actually love</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              LeadFlow gives modern sales teams a beautiful, lightning-fast home for every lead — from first touch to closed-won.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link to="/signup">
                <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow">
                  Start free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#features"><Button size="lg" variant="outline">See features</Button></a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto mt-20 max-w-5xl">
            <div className="rounded-2xl border border-border/50 bg-card p-2 shadow-elegant">
              <div className="rounded-xl bg-gradient-soft p-8 md:p-12">
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                  {[
                    { label: "Total Leads", value: "1,284" },
                    { label: "Converted", value: "342" },
                    { label: "This Week", value: "+47" },
                    { label: "Pipeline", value: "$84K" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-card">
                      <div className="text-xs font-medium text-muted-foreground">{s.label}</div>
                      <div className="mt-2 text-2xl font-bold text-gradient">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight">Everything you need. Nothing you don't.</h2>
          <p className="mt-4 text-muted-foreground">Built for revenue teams who care about craft.</p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-elegant hover:-translate-y-0.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-primary shadow-elegant">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="bg-gradient-soft py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-4xl font-bold tracking-tight">Built to help you close.</h2>
              <p className="mt-4 text-muted-foreground">
                Every feature is designed around one goal: helping you spend more time talking to prospects, and less time managing tools.
              </p>
              <ul className="mt-8 space-y-3">
                {benefits.map((b) => (
                  <li key={b} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant">
                <div className="space-y-4">
                  {["New", "Contacted", "Interested", "Converted"].map((s, i) => (
                    <div key={s} className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-gradient-primary" />
                        <span className="font-medium">{s}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{[24, 18, 12, 7][i]} leads</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight">Loved by sales teams</h2>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="mt-4 text-sm">"{t.quote}"</p>
              <div className="mt-6">
                <div className="font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA / Contact */}
      <section id="contact" className="container mx-auto px-4 pb-24">
        <div className="overflow-hidden rounded-3xl bg-gradient-primary p-12 text-center shadow-elegant md:p-20">
          <h2 className="text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl">
            Ready to close more deals?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Get started in under 60 seconds. No credit card required.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="shadow-elegant">
                Create free account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="mailto:hello@leadflow.app">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                Contact sales
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">LeadFlow</span>
            <span className="text-xs text-muted-foreground">© 2026</span>
          </div>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="#">Privacy</a><a href="#">Terms</a><a href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
