import { CopyButton } from "./CopyButton";

interface CommandBlockProps {
  command: string;
  description?: string;
}

export function CommandBlock({ command, description }: CommandBlockProps) {
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
