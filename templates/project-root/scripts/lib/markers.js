import fs from "node:fs";
import path from "node:path";

import { KICKSTACK_DIR } from "./paths.js";

export function isMarked(name) {
  return fs.existsSync(path.join(KICKSTACK_DIR, name));
}
