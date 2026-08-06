import { Router } from "express";

import { checkDatabase } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  const connected = await checkDatabase();
  const database = connected ? "connected" : "disconnected";
  const healthy = connected;

  res.json({
    server: "running",
    database,
    status: healthy ? "healthy" : "degraded",
    api: "working",
  });
});

export default router;
