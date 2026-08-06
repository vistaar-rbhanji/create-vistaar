export type StatusBadgeState = "ok" | "warn" | "error" | "neutral";

interface StatusBadgeProps {
  label: string;
  state: StatusBadgeState;
}

const DOT: Record<StatusBadgeState, string> = {
  ok: "🟢",
  warn: "🟡",
  error: "🔴",
  neutral: "⚪",
};

export function StatusBadge({ label, state }: StatusBadgeProps) {
  return (
    <span className={"status-badge status-badge--" + state}>
      <span className="status-badge__dot" aria-hidden="true">
        {DOT[state]}
      </span>
      {label}
    </span>
  );
}
