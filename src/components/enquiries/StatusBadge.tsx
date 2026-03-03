import { Badge } from "@/components/ui/badge";
import { ENQUIRY_STATUS_COLORS, ENQUIRY_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge className={cn(ENQUIRY_STATUS_COLORS[status] || "bg-gray-100 text-gray-800", className)}>
      {ENQUIRY_STATUS_LABELS[status] || status}
    </Badge>
  );
}
