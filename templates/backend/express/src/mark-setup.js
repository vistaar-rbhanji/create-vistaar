import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".kickstack");

export function mark(name) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), "1");
}

export function isMarked(name) {
  return fs.existsSync(path.join(dir, name));
}
