import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createLead, updateLead, type Lead, type LeadStatus } from "@/lib/leads-api";
import { STATUS_OPTIONS } from "./status-badge";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  source: z.string().trim().max(80).optional().or(z.literal("")),
  status: z.enum(["new", "contacted", "interested", "not_interested", "converted"]),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  lead?: Lead | null;
}

export function LeadFormDialog({ open, onOpenChange, lead }: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "", source: "", status: "new" as LeadStatus, notes: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        name: lead?.name ?? "",
        email: lead?.email ?? "",
        phone: lead?.phone ?? "",
        company: lead?.company ?? "",
        source: lead?.source ?? "",
        status: (lead?.status as LeadStatus) ?? "new",
        notes: lead?.notes ?? "",
      });
    }
  }, [open, lead]);

  const mutation = useMutation({
    mutationFn: async (values: typeof form) => {
      const payload = {
        name: values.name,
        email: values.email || null,
        phone: values.phone || null,
        company: values.company || null,
        source: values.source || null,
        status: values.status,
        notes: values.notes || null,
      };
      return lead ? updateLead(lead.id, payload) : createLead(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["activities"] });
      qc.invalidateQueries({ queryKey: ["lead", lead?.id] });
      toast.success(lead ? "Lead updated" : "Lead created");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    mutation.mutate(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{lead ? "Edit lead" : "Add new lead"}</DialogTitle>
          <DialogDescription>{lead ? "Update lead details below." : "Capture a new prospect in your pipeline."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="source">Source</Label>
              <Input id="source" placeholder="Website, Referral..." value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as LeadStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-gradient-primary text-primary-foreground">
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (lead ? "Save changes" : "Create lead")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
