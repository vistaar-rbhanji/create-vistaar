export type SetupStepState = "complete" | "pending" | "running";

interface SetupStepProps {
  label: string;
  state: SetupStepState;
  detail?: string;
}

const ICON: Record<SetupStepState, string> = {
  complete: "✅",
  pending: "⚠",
  running: "⏳",
};

const TEXT: Record<SetupStepState, string> = {
  complete: "Complete",
  pending: "Pending",
  running: "Running",
};

export function SetupStep({ label, state, detail }: SetupStepProps) {
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
