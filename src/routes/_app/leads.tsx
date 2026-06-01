import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Search, Download, Trash2, Pencil, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge, STATUS_OPTIONS } from "@/components/status-badge";
import { LeadFormDialog } from "@/components/lead-form-dialog";
import { listLeads, deleteLead, type Lead, type LeadStatus } from "@/lib/leads-api";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_app/leads")({
  head: () => ({ meta: [{ title: "Leads — LeadFlow" }] }),
  component: LeadsPage,
});

const PAGE_SIZE = 10;

function LeadsPage() {
  const qc = useQueryClient();
  const { data: leads = [], isLoading } = useQuery({ queryKey: ["leads"], queryFn: listLeads });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "name">("newest");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<Lead | null>(null);

  const delMutation = useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["activities"] });
      toast.success("Lead deleted");
      setToDelete(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    let r = leads;
    if (status !== "all") r = r.filter((l) => l.status === status);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((l) =>
        l.name.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.company?.toLowerCase().includes(q) ||
        l.phone?.toLowerCase().includes(q),
      );
    }
    r = [...r].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return sort === "newest" ? diff : -diff;
    });
    return r;
  }, [leads, status, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCSV = () => {
    if (filtered.length === 0) { toast.error("No leads to export"); return; }
    const headers = ["Name", "Email", "Phone", "Company", "Source", "Status", "Notes", "Created"];
    const rows = filtered.map((l) => [l.name, l.email ?? "", l.phone ?? "", l.company ?? "", l.source ?? "", l.status, (l.notes ?? "").replace(/\n/g, " "), l.created_at]);
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported");
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground">{leads.length} total leads</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
          <Button onClick={() => setCreating(true)} className="bg-gradient-primary text-primary-foreground shadow-elegant">
            <Plus className="mr-2 h-4 w-4" /> Add lead
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search leads…" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v as LeadStatus | "all"); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="name">Name A–Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-soft">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-semibold">No leads found</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              {leads.length === 0 ? "Add your first lead to start building your pipeline." : "Try adjusting your search or filters."}
            </p>
            {leads.length === 0 && (
              <Button onClick={() => setCreating(true)} className="bg-gradient-primary text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" /> Add your first lead
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3 hidden md:table-cell">Company</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Email</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 hidden md:table-cell">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((l) => (
                    <tr key={l.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                      <td className="px-4 py-3">
                        <Link to="/leads/$id" params={{ id: l.id }} className="font-medium hover:text-primary">{l.name}</Link>
                        <div className="text-xs text-muted-foreground md:hidden">{l.company || l.email || "—"}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{l.company || "—"}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{l.email || "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{format(new Date(l.created_at), "MMM d, yyyy")}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => setEditing(l)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => setToDelete(l)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
              <div className="text-muted-foreground">Page {page} of {totalPages}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          </>
        )}
      </div>

      <LeadFormDialog open={creating} onOpenChange={setCreating} />
      <LeadFormDialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)} lead={editing} />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete lead?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete "{toDelete?.name}" and all related notes and activity.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => toDelete && delMutation.mutate(toDelete.id)}
              className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
