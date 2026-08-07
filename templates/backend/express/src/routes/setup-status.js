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

function isDatabaseConfigured(driver) {
  if (!driver || driver === "file") {
    return true;
  }
  if (driver === "mongoose" || driver === "motor") {
    return Boolean(process.env.MONGODB_URI);
  }
  return Boolean(process.env.DATABASE_URL);
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
  const migrationNotApplicable = !databaseRequired || driver === "file" || driver === "mongoose";
  const migrationCompleted = migrationNotApplicable || isMarked("migrated") || Boolean(appInfo);

  const seedCompleted = Boolean(appInfo) || isMarked("seeded");

  const setupComplete = !databaseRequired
    ? seedCompleted
    : databaseConfigured && databaseConnected && migrationCompleted && seedCompleted;

  res.json({
    projectGenerated: true,
    projectName: (appInfo && appInfo.projectName) || seedData.projectName,
    databaseEngine,
    databaseRequired,
    databaseConfigured,
    databaseConnected,
    migrationCompleted,
    seedCompleted,
    backendRunning: true,
    frontendRunning: true,
    dockerEnabled: seedData.docker === "Enabled",
    authenticationEnabled: seedData.authentication !== "Disabled",
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
    },
  });
});

export default router;
