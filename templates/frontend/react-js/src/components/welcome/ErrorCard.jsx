export function ErrorCard({ title, message }) {
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
