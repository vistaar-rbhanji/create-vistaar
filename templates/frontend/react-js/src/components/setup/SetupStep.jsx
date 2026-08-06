const ICON = {
  complete: "✅",
  pending: "⚠",
  running: "⏳",
};

const TEXT = {
  complete: "Complete",
  pending: "Pending",
  running: "Running",
};

export function SetupStep({ label, state, detail }) {
  return (
    <div className={"setup-step setup-step--" + state}>
      <div className="setup-step__icon" aria-hidden="true">
        {ICON[state]}
      </div>
      <div className="setup-step__body">
        <p className="setup-step__label">{label}</p>
        {detail && <p className="setup-step__detail">{detail}</p>}
      </div>
      <span className="setup-step__status">{TEXT[state]}</span>
    </div>
  );
}
