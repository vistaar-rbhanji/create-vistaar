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

  if (status.databaseEngine === "MongoDB") {
    return (
      <div className="database-help">
        <p className="database-help__text">
          MongoDB creates the <strong>{status.dbName}</strong> database automatically
          the first time a document is inserted. No manual database creation is
          required — just make sure MongoDB is running and reachable at the
          connection string in your backend <code>.env</code> file.
        </p>
      </div>
    );
  }

  return (
    <div className="database-help">
      <p className="database-help__text">
        Create the <strong>{status.dbName}</strong> database before running migrations.
      </p>
      <div className="database-help__row">
        <span className="database-help__row-label">Database Name</span>
        <div className="database-help__row-value">
          <code>{status.dbName}</code>
          <CopyButton value={status.dbName} />
        </div>
      </div>
      <CommandBlock command={status.commands.createDb} description="Create it with the createdb CLI" />
      <CommandBlock command={status.commands.createDbSql} description="Or run this SQL statement" />
    </div>
  );
}
