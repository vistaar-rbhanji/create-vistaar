import { CopyButton } from "./CopyButton";

export function CommandBlock({ command, description }) {
  return (
    <div className="command-block">
      <div className="command-block__text">
        <code>{command}</code>
        {description && <span className="command-block__hint">{description}</span>}
      </div>
      <CopyButton value={command} />
    </div>
  );
}
