import type { VistaarUIComponents } from "../../contract/types";

/**
 * ShadCN / Tailwind-oriented adapter.
 * Uses semantic class names compatible with typical shadcn + Tailwind setups.
 * Does not install a second CSS framework beyond what the UI overlay already added.
 */
export const authUI: VistaarUIComponents = {
  Button: ({ variant = "primary", className = "", children, ...props }) => {
    const map = {
      primary:
        "inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 px-4 py-2 text-sm font-medium",
      secondary:
        "inline-flex items-center justify-center rounded-md border border-input bg-background h-10 px-4 py-2 text-sm font-medium",
      ghost:
        "inline-flex items-center justify-center rounded-md hover:bg-accent h-10 px-4 py-2 text-sm font-medium",
    } as const;
    return (
      <button type="button" className={`${map[variant]} ${className}`.trim()} {...props}>
        {children}
      </button>
    );
  },

  Input: ({ className = "", ...props }) => (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`.trim()}
      {...props}
    />
  ),

  Label: ({ className = "", children, ...props }) => (
    <label className={`text-sm font-medium leading-none ${className}`.trim()} {...props}>
      {children}
    </label>
  ),

  Card: ({ className = "", children }) => (
    <div className={`rounded-xl border bg-card text-card-foreground shadow ${className}`.trim()}>
      {children}
    </div>
  ),

  CardHeader: ({ className = "", children }) => (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`.trim()}>{children}</div>
  ),

  CardTitle: ({ className = "", children }) => (
    <h2 className={`text-2xl font-semibold leading-none tracking-tight ${className}`.trim()}>
      {children}
    </h2>
  ),

  CardDescription: ({ className = "", children }) => (
    <p className={`text-sm text-muted-foreground ${className}`.trim()}>{children}</p>
  ),

  CardContent: ({ className = "", children }) => (
    <div className={`p-6 pt-0 ${className}`.trim()}>{children}</div>
  ),

  Alert: ({ tone = "error", className = "", children }) => (
    <div
      className={`relative w-full rounded-lg border px-4 py-3 text-sm ${
        tone === "error" ? "border-destructive/50 text-destructive" : "text-foreground"
      } ${className}`.trim()}
      role="alert"
    >
      {children}
    </div>
  ),

  Spinner: ({ label = "Loading…", className = "" }) => (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`.trim()}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      {label}
    </div>
  ),
};

export default authUI;
