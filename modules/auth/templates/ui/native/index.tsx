import type { VistaarUIComponents } from "../../contract/types";

/**
 * Native HTML adapter (no extra UI framework).
 * Used when the host has no component library, and as the visual baseline.
 */
export const authUI: VistaarUIComponents = {
  Button: ({ variant = "primary", className = "", children, ...props }) => (
    <button
      type="button"
      className={["va-btn", `va-btn--${variant}`, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </button>
  ),

  Input: ({ className = "", ...props }) => (
    <input className={["va-input", className].filter(Boolean).join(" ")} {...props} />
  ),

  Label: ({ className = "", children, ...props }) => (
    <label className={["va-label", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </label>
  ),

  Card: ({ className = "", children }) => (
    <div className={["va-card", className].filter(Boolean).join(" ")}>{children}</div>
  ),

  CardHeader: ({ className = "", children }) => (
    <div className={["va-card__header", className].filter(Boolean).join(" ")}>{children}</div>
  ),

  CardTitle: ({ className = "", children }) => (
    <h2 className={["va-card__title", className].filter(Boolean).join(" ")}>{children}</h2>
  ),

  CardDescription: ({ className = "", children }) => (
    <p className={["va-card__description", className].filter(Boolean).join(" ")}>{children}</p>
  ),

  CardContent: ({ className = "", children }) => (
    <div className={["va-card__content", className].filter(Boolean).join(" ")}>{children}</div>
  ),

  Alert: ({ tone = "error", className = "", children }) => (
    <p className={["va-alert", `va-alert--${tone}`, className].filter(Boolean).join(" ")}>
      {children}
    </p>
  ),

  Spinner: ({ label = "Loading…", className = "" }) => (
    <div className={["va-spinner", className].filter(Boolean).join(" ")} role="status">
      {label}
    </div>
  ),
};

export default authUI;
