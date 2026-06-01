import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Pencil, Trash2, Mail, Phone, Building2, Tag, Loader2, Plus, Activity as ActivityIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/status-badge";
import { LeadFormDialog } from "@/components/lead-form-dialog";
import { getLead, listNotes, addNote, updateNote, deleteNote, listActivities, deleteLead } from "@/lib/leads-api";
import { format, formatDistanceToNow } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_app/leads/$id")({
  head: () => ({ meta: [{ title: "Lead details — LeadFlow" }] }),
  component: LeadDetails,
});

function LeadDetails() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState("");

  const { data: lead, isLoading } = useQuery({ queryKey: ["lead", id], queryFn: () => getLead(id) });
  const { data: notes = [] } = useQuery({ queryKey: ["notes", id], queryFn: () => listNotes(id) });
  const { data: acts = [] } = useQuery({ queryKey: ["activities", id], queryFn: () => listActivities(20, id) });

  const addM = useMutation({
    mutationFn: (c: string) => addNote(id, c),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes", id] });
      qc.invalidateQueries({ queryKey: ["activities", id] });
      qc.invalidateQueries({ queryKey: ["activities"] });
      setNoteText(""); toast.success("Note added");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const upM = useMutation({
    mutationFn: ({ nid, c }: { nid: string; c: string }) => updateNote(nid, c),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notes", id] }); setEditNoteId(null); toast.success("Note updated"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const delNoteM = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notes", id] }); toast.success("Note deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const delLeadM = useMutation({
    mutationFn: () => deleteLead(id),
    onSuccess: () => { toast.success("Lead deleted"); navigate({ to: "/leads" }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!lead) return (
    <div className="container mx-auto max-w-3xl p-8 text-center">
      <h2 className="text-xl font-semibold">Lead not found</h2>
      <Link to="/leads"><Button variant="outline" className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" />Back to leads</Button></Link>
    </div>
  );

  return (
    <div className="container mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <Link to="/leads" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to leads
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary text-xl font-bold text-primary-foreground shadow-elegant">
              {lead.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{lead.name}</h1>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status={lead.status} />
                <span className="text-xs text-muted-foreground">Added {format(new Date(lead.created_at), "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(true)}><Pencil className="mr-2 h-4 w-4" /> Edit</Button>
            <Button variant="outline" onClick={() => setConfirmDel(true)}><Trash2 className="mr-2 h-4 w-4 text-destructive" /> Delete</Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <InfoItem icon={Mail} label="Email" value={lead.email} />
          <InfoItem icon={Phone} label="Phone" value={lead.phone} />
          <InfoItem icon={Building2} label="Company" value={lead.company} />
          <InfoItem icon={Tag} label="Source" value={lead.source} />
        </div>
        {lead.notes && (
          <div className="mt-6 rounded-lg border border-border bg-secondary/30 p-4">
            <div className="text-xs font-medium text-muted-foreground">Quick notes</div>
            <p className="mt-1 whitespace-pre-wrap text-sm">{lead.notes}</p>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-semibold">Notes</h3>
          <div className="mt-4 flex gap-2">
            <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note…" rows={2} />
            <Button disabled={!noteText.trim() || addM.isPending} onClick={() => addM.mutate(noteText.trim())}
              className="bg-gradient-primary text-primary-foreground self-end">
              {addM.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {notes.length === 0 && <p className="text-sm text-muted-foreground">No notes yet.</p>}
            {notes.map((n) => (
              <div key={n.id} className="rounded-lg border border-border bg-background p-3">
                {editNoteId === n.id ? (
                  <div className="space-y-2">
                    <Textarea value={editNoteText} onChange={(e) => setEditNoteText(e.target.value)} rows={2} />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditNoteId(null)}>Cancel</Button>
                      <Button size="sm" onClick={() => upM.mutate({ nid: n.id, c: editNoteText.trim() })}
                        className="bg-gradient-primary text-primary-foreground">Save</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap text-sm">{n.content}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditNoteId(n.id); setEditNoteText(n.content); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => delNoteM.mutate(n.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Activity log</h3>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-4 space-y-3">
            {acts.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
            {acts.map((a) => (
              <div key={a.id} className="flex gap-3 rounded-lg border border-border bg-background p-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-gradient-primary" />
                <div>
                  <div className="text-sm font-medium">{a.description || a.action}</div>
                  <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <LeadFormDialog open={editing} onOpenChange={setEditing} lead={lead} />
      <AlertDialog open={confirmDel} onOpenChange={setConfirmDel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete lead?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete "{lead.name}" and all related data.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => delLeadM.mutate()} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string | null }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value || "—"}</div>
      </div>
    </div>
  );
}
