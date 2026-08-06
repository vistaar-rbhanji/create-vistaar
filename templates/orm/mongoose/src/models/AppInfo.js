import mongoose from "mongoose";

const appInfoSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  frontend: { type: String, required: true },
  backend: { type: String, required: true },
  database: { type: String, required: true },
  orm: { type: String, required: true },
  uiFramework: { type: String, required: true },
  authentication: { type: String, required: true },
  docker: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const AppInfo = mongoose.models.AppInfo || mongoose.model("AppInfo", appInfoSchema);
