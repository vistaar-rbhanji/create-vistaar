export function SetupProgress({ percent }) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <div className="setup-progress">
      <div
        className="setup-progress__track"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="setup-progress__fill" style={{ width: clamped + "%" }} />
      </div>
      <p className="setup-progress__label">{clamped}% Complete</p>
    </div>
  );
}
