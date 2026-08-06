import { Router } from "express";

import { getAppInfo } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const appInfo = await getAppInfo();
    if (!appInfo) {
      res.status(404).json({ error: "AppInfo has not been seeded yet." });
      return;
    }
    res.json(appInfo);
  } catch (error) {
    res.status(500).json({ error: "Failed to load app info.", message: error.message });
  }
});

export default router;
