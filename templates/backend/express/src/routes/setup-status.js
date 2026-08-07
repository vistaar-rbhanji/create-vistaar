import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Router } from "express";

import { checkDatabase, getAppInfo, getDriverName } from "../db.js";
import { isMarked } from "../mark-setup.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "seed-data.json"), "utf8"),
);

const router = Router();
const projectRoot = path.resolve(__dirname, "../../..");
const authVistaar = path.join(projectRoot, "auth-api", ".vistaar");

function isDatabaseConfigured(driver) {
  if (!driver || driver === "file") {
    return true;
  }
  if (driver === "mongoose" || driver === "motor") {
    return Boolean(process.env.MONGODB_URI);
  }
  return Boolean(process.env.DATABASE_URL);
}

function requiredEnvVar(driver, databaseEngine) {
  if (!databaseEngine || databaseEngine === "None") {
    return null;
  }
  if (databaseEngine === "MongoDB" || driver === "mongoose" || driver === "motor") {
    return "MONGODB_URI";
  }
  return "DATABASE_URL";
}

function readAuthSetup() {
  const authenticationInstalled =
    seedData.authentication === "Base Auth" ||
    fs.existsSync(path.join(projectRoot, "auth-api", "package.json"));

  const pendingAdmin = fs.existsSync(
    path.join(authVistaar, "initial-admin.json"),
  );
  const initialAdminCreated = fs.existsSync(
    path.join(authVistaar, "initial-admin-seeded"),
  );

  let authMigrationCompleted = false;
  try {
    const statePath = path.join(authVistaar, "setup-state.json");
    if (fs.existsSync(statePath)) {
      const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
      authMigrationCompleted = state.migration === "complete";
    }
  } catch {
    authMigrationCompleted = false;
  }

  // Roles table marker: if Super Admin was seeded, migrations clearly ran.
  if (initialAdminCreated) {
    authMigrationCompleted = true;
  }

  return {
    authenticationInstalled,
    authMigrationCompleted,
    initialAdminPending: pendingAdmin && !initialAdminCreated,
    initialAdminCreated,
  };
}

function buildDatabaseHint(databaseEngine, databaseConfigured, databaseConnected) {
  if (!databaseConfigured) {
    return {
      title: "Database not configured",
      steps: [
        "Create your database using your preferred tool (local, Docker, or cloud).",
        "Open the backend .env file (and auth-api/.env if present).",
        `Set ${databaseEngine === "MongoDB" ? "MONGODB_URI" : "DATABASE_URL"}.`,
        "Restart the application.",
      ],
      technical: null,
    };
  }
  if (!databaseConnected) {
    return {
      title:
        databaseEngine === "MongoDB"
          ? "MongoDB connection failed."
          : "PostgreSQL connection failed.",
      steps: [
        `${databaseEngine === "MongoDB" ? "MongoDB" : "PostgreSQL"} is running.`,
        "The database exists (for PostgreSQL).",
        `${databaseEngine === "MongoDB" ? "MONGODB_URI" : "DATABASE_URL"} in .env is correct.`,
      ],
      technical: "Connection check returned disconnected.",
    };
  }
  return null;
}

router.get("/", async (_req, res) => {
  const driver = getDriverName();
  const databaseEngine = "{{DATABASE}}";
  const databaseRequired = databaseEngine !== "None";

  const databaseConfigured = !databaseRequired || isDatabaseConfigured(driver);
  const databaseConnected = databaseRequired ? await checkDatabase() : true;

  let appInfo = null;
  try {
    appInfo = await getAppInfo();
  } catch {
    appInfo = null;
  }

  // MongoDB and the file store need no explicit migration step.
  const migrationNotApplicable =
    !databaseRequired || driver === "file" || driver === "mongoose";
  const migrationCompleted =
    migrationNotApplicable || isMarked("migrated") || Boolean(appInfo);

  const seedCompleted = Boolean(appInfo) || isMarked("seeded");
  const auth = readAuthSetup();

  const setupComplete = !databaseRequired
    ? seedCompleted && (!auth.authenticationInstalled || auth.initialAdminCreated)
    : databaseConfigured &&
      databaseConnected &&
      migrationCompleted &&
      seedCompleted &&
      (!auth.authenticationInstalled ||
        (auth.authMigrationCompleted && auth.initialAdminCreated));

  const databaseHint = databaseRequired
    ? buildDatabaseHint(databaseEngine, databaseConfigured, databaseConnected)
    : null;

  res.json({
    projectGenerated: true,
    projectName: (appInfo && appInfo.projectName) || seedData.projectName,
    frontend: seedData.frontend,
    backend: seedData.backend,
    databaseEngine,
    databaseRequired,
    databaseConfigured,
    databaseConnected,
    databaseHint,
    requiredEnvVar: requiredEnvVar(driver, databaseEngine),
    migrationCompleted,
    seedCompleted,
    backendRunning: true,
    frontendRunning: true,
    dockerEnabled: seedData.docker === "Enabled",
    authenticationEnabled: seedData.authentication !== "Disabled",
    authentication: seedData.authentication,
    authenticationInstalled: auth.authenticationInstalled,
    authMigrationCompleted: auth.authMigrationCompleted,
    initialAdminPending: auth.initialAdminPending,
    initialAdminCreated: auth.initialAdminCreated,
    setupComplete,
    dbName: "{{DB_NAME}}",
    commands: {
      createDb: "createdb {{DB_NAME}}",
      createDbSql: "CREATE DATABASE {{DB_NAME}};",
      migrate: "npm run migrate",
      seed: "npm run seed",
      setup: "npm run setup",
      docker: "docker compose up -d",
      doctor: "npm run doctor",
      login: "/login",
    },
  });
});

export default router;
