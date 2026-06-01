import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/lib/leads-api";

const STYLES: Record<LeadStatus, string> = {
  new: "bg-primary/10 text-primary border-primary/20",
  contacted: "bg-accent/10 text-accent border-accent/20",
  interested: "bg-warning/15 text-warning-foreground border-warning/30 bg-[color-mix(in_oklab,var(--warning)_20%,transparent)]",
  not_interested: "bg-muted text-muted-foreground border-border",
  converted: "bg-success/15 border-success/30 text-[color:var(--success)]",
};

const LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  interested: "Interested",
  not_interested: "Not Interested",
  converted: "Converted",
};

export function StatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", STYLES[status], className)}>
      {LABELS[status]}
    </span>
  );
}

export const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "interested", label: "Interested" },
  { value: "not_interested", label: "Not Interested" },
  { value: "converted", label: "Converted" },
];
