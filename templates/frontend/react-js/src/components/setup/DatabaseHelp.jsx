import { CommandBlock } from "./CommandBlock";
import { CopyButton } from "./CopyButton";

export function DatabaseHelp({ status }) {
  if (!status.databaseRequired) {
    return (
      <div className="database-help">
        <p className="database-help__text">
          This project does not use a database. There is nothing to configure here.
        </p>
      </div>
    );
  }

  const connected = status.databaseConfigured && status.databaseConnected;
  const envVar =
    status.requiredEnvVar ||
    (status.databaseEngine === "MongoDB" ? "MONGODB_URI" : "DATABASE_URL");
  const hint = status.databaseHint;

  return (
    <div className="database-help">
      <div className="database-help__row">
        <span className="database-help__row-label">Engine</span>
        <div className="database-help__row-value">
          <strong>{status.databaseEngine}</strong>
        </div>
      </div>

      <div className="database-help__row">
        <span className="database-help__row-label">Status</span>
        <div className="database-help__row-value">
          {connected ? (
            <span className="setup-status-pill setup-status-pill--ok">Connected</span>
          ) : (
            <span className="setup-status-pill setup-status-pill--warn">Not connected</span>
          )}
        </div>
      </div>

      <div className="database-help__row">
        <span className="database-help__row-label">Database name</span>
        <div className="database-help__row-value">
          <code>{status.dbName}</code>
          <CopyButton value={status.dbName} />
        </div>
      </div>

      <div className="database-help__row">
        <span className="database-help__row-label">Env variable</span>
        <div className="database-help__row-value">
          <code>{envVar}</code>
        </div>
      </div>

      {!connected && hint && (
        <div className="database-help__next" role="status">
          <h3 className="database-help__next-title">{hint.title}</h3>
          <ol className="database-help__steps">
            {hint.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {hint.technical && (
            <details className="database-help__tech">
              <summary>Show technical details</summary>
              <pre>{hint.technical}</pre>
            </details>
          )}
        </div>
      )}

      {status.databaseEngine === "MongoDB" ? (
        <p className="database-help__text">
          MongoDB creates the database automatically when the first document is
          inserted. Update <code>backend/.env</code> with your connection string,
          then restart the backend.
        </p>
      ) : (
        !connected && (
          <>
            <p className="database-help__text">
              Create the database with any method you prefer (local install, Docker,
              or a cloud provider). Vistaar does not create the database for you.
            </p>
            <details className="database-help__tech">
              <summary>Optional CLI / SQL examples</summary>
              <CommandBlock command={status.commands.createDb} description="createdb CLI" />
              <CommandBlock command={status.commands.createDbSql} description="SQL" />
            </details>
          </>
        )
      )}
    </div>
  );
}
