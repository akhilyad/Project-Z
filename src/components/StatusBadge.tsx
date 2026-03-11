"use client";

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<
  string,
  { label: string; className: string; icon: string }
> = {
  drafting: { label: "Drafting", className: "badge-info", icon: "✏️" },
  applying: { label: "In Progress", className: "badge-info", icon: "⚡" },
  success: { label: "Applied", className: "badge-success", icon: "✓" },
  manual_review: {
    label: "Needs Review",
    className: "badge-warning",
    icon: "👁",
  },
  failed: { label: "Failed", className: "badge-danger", icon: "✕" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.drafting;

  return (
    <span className={`badge ${config.className}`}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}
