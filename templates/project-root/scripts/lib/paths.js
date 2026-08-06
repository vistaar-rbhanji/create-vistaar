import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const FRONTEND_DIR = path.join(ROOT, "frontend");
export const BACKEND_DIR = path.join(ROOT, "backend");
export const KICKSTACK_DIR = path.join(BACKEND_DIR, ".kickstack");
