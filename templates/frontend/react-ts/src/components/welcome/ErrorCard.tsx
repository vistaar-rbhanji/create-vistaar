interface ErrorCardProps {
  title: string;
  message: string;
}

export function ErrorCard({ title, message }: ErrorCardProps) {
  return (
    <div className="error-card" role="alert">
      <div className="error-card__icon" aria-hidden="true">
        ⚠️
      </div>
      <div>
        <p className="error-card__title">{title}</p>
        <p className="error-card__message">{message}</p>
      </div>
    </div>
  );
}
