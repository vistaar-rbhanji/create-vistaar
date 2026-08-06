const DOT = {
  ok: "🟢",
  warn: "🟡",
  error: "🔴",
  neutral: "⚪",
};

export function StatusBadge({ label, state }) {
  return (
    <span className={"status-badge status-badge--" + state}>
      <span className="status-badge__dot" aria-hidden="true">
        {DOT[state]}
      </span>
      {label}
    </span>
  );
}
