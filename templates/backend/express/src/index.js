import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import cors from "cors";
import express from "express";

import { connect, seedIfEmpty } from "./db.js";
import appInfoRoutes from "./routes/app-info.js";
import healthRoutes from "./routes/health.js";
import setupStatusRoutes from "./routes/setup-status.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectName = "{{PROJECT_NAME}}";
const seedData = JSON.parse(fs.readFileSync(path.join(__dirname, "seed-data.json"), "utf8"));

const app = express();
const port = process.env.PORT || {{BACKEND_PORT}};

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.use("/api/app-info", appInfoRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/setup-status", setupStatusRoutes);

app.listen(port, async () => {
  console.log(projectName + " API listening on port " + port);
  try {
    await connect();
    await seedIfEmpty(seedData);
    console.log("[db] ready");
  } catch (error) {
    console.error("[db] startup error:", error.message);
  }
});

export default app;
