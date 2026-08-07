import type { VistaarUIComponents } from "../../contract/types";

/**
 * Bootstrap 5 adapter — uses Bootstrap utility/component classes only.
 * Does not pull Tailwind or other CSS frameworks.
 */
export const authUI: VistaarUIComponents = {
  Button: ({ variant = "primary", className = "", children, ...props }) => {
    const map = {
      primary: "btn btn-primary",
      secondary: "btn btn-outline-secondary",
      ghost: "btn btn-link",
    } as const;
    return (
      <button type="button" className={`${map[variant]} ${className}`.trim()} {...props}>
        {children}
      </button>
    );
  },

  Input: ({ className = "", ...props }) => (
    <input className={`form-control ${className}`.trim()} {...props} />
  ),

  Label: ({ className = "", children, ...props }) => (
    <label className={`form-label ${className}`.trim()} {...props}>
      {children}
    </label>
  ),

  Card: ({ className = "", children }) => (
    <div className={`card shadow-sm ${className}`.trim()}>{children}</div>
  ),

  CardHeader: ({ className = "", children }) => (
    <div className={`card-header bg-white ${className}`.trim()}>{children}</div>
  ),

  CardTitle: ({ className = "", children }) => (
    <h2 className={`h5 mb-0 ${className}`.trim()}>{children}</h2>
  ),

  CardDescription: ({ className = "", children }) => (
    <p className={`text-muted small mb-0 ${className}`.trim()}>{children}</p>
  ),

  CardContent: ({ className = "", children }) => (
    <div className={`card-body ${className}`.trim()}>{children}</div>
  ),

  Alert: ({ tone = "error", className = "", children }) => (
    <div
      className={`alert ${tone === "error" ? "alert-danger" : "alert-info"} ${className}`.trim()}
      role="alert"
    >
      {children}
    </div>
  ),

  Spinner: ({ label = "Loading…", className = "" }) => (
    <div className={`d-flex align-items-center gap-2 ${className}`.trim()} role="status">
      <div className="spinner-border spinner-border-sm" aria-hidden="true" />
      <span>{label}</span>
    </div>
  ),
};

export default authUI;
