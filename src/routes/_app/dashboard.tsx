import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, UserPlus, CheckCircle2, Clock, Plus, ArrowRight, Activity as ActivityIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { useMemo, useState } from "react";
import { listLeads, listActivities, type Lead } from "@/lib/leads-api";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { LeadFormDialog } from "@/components/lead-form-dialog";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — LeadFlow" }] }),
  component: Dashboard,
});

const STATUS_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Dashboard() {
  const [openNew, setOpenNew] = useState(false);
  const { data: leads = [], isLoading } = useQuery({ queryKey: ["leads"], queryFn: listLeads });
  const { data: activities = [] } = useQuery({ queryKey: ["activities"], queryFn: () => listActivities(8) });

  const stats = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 86400000;
    return {
      total: leads.length,
      newCount: leads.filter((l) => l.status === "new").length,
      converted: leads.filter((l) => l.status === "converted").length,
      pending: leads.filter((l) => ["contacted", "interested"].includes(l.status)).length,
      thisWeek: leads.filter((l) => new Date(l.created_at).getTime() > weekAgo).length,
    };
  }, [leads]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => { counts[l.status] = (counts[l.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace("_", " "), value }));
  }, [leads]);

  const weeklyData = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0, 0, 0, 0);
      return { label: d.toLocaleDateString("en", { weekday: "short" }), ts: d.getTime(), count: 0 };
    });
    leads.forEach((l) => {
      const t = new Date(l.created_at).getTime();
      for (let i = 0; i < days.length; i++) {
        const end = i === days.length - 1 ? Date.now() : days[i + 1].ts;
        if (t >= days[i].ts && t < end) { days[i].count++; break; }
      }
    });
    return days;
  }, [leads]);

  const cards = [
    { label: "Total Leads", value: stats.total, icon: Users, tint: "from-primary to-primary-glow" },
    { label: "New Leads", value: stats.newCount, icon: UserPlus, tint: "from-accent to-primary" },
    { label: "Converted", value: stats.converted, icon: CheckCircle2, tint: "from-[color:var(--success)] to-primary" },
    { label: "Pending Follow-ups", value: stats.pending, icon: Clock, tint: "from-accent to-primary-glow" },
  ];

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back. Here's what's happening with your pipeline.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setOpenNew(true)} className="bg-gradient-primary text-primary-foreground shadow-elegant">
            <Plus className="mr-2 h-4 w-4" /> Add lead
          </Button>
          <Link to="/leads"><Button variant="outline">View all leads <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{c.label}</div>
                <div className="mt-2 text-3xl font-bold">{isLoading ? "—" : c.value}</div>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${c.tint} shadow-elegant`}>
                <c.icon className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card lg:col-span-2">
          <h3 className="font-semibold">Leads this week</h3>
          <p className="text-xs text-muted-foreground">+{stats.thisWeek} new leads in the last 7 days</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-semibold">By status</h3>
          <p className="text-xs text-muted-foreground">Distribution across your pipeline</p>
          <div className="mt-4 h-64">
            {statusData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={2}>
                    {statusData.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Recent activity</h3>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-4 space-y-3">
            {activities.length === 0 && (
              <p className="text-sm text-muted-foreground">No activity yet. Add a lead to get started.</p>
            )}
            {activities.map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-gradient-primary" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{a.description || a.action}</div>
                  <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-semibold">Recent leads</h3>
          <div className="mt-4 space-y-2">
            {leads.length === 0 && <p className="text-sm text-muted-foreground">No leads yet.</p>}
            {leads.slice(0, 5).map((l: Lead) => (
              <Link key={l.id} to="/leads/$id" params={{ id: l.id }}
                className="flex items-center justify-between rounded-lg border border-border bg-background p-3 hover:bg-secondary">
                <div>
                  <div className="font-medium">{l.name}</div>
                  <div className="text-xs text-muted-foreground">{l.company || l.email || "—"}</div>
                </div>
                <StatusBadge status={l.status} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <LeadFormDialog open={openNew} onOpenChange={setOpenNew} />
    </div>
  );
}
