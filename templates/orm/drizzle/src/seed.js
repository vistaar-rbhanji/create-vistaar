import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { connect, seedIfEmpty } from "./db-drizzle.js";
import { mark } from "./mark-setup.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedData = JSON.parse(fs.readFileSync(path.join(__dirname, "seed-data.json"), "utf8"));

async function main() {
  await connect();
  const record = await seedIfEmpty(seedData);
  console.log("[seed] AppInfo ready:", record);
  mark("seeded");
}

main().catch((error) => {
  console.error("[seed] failed:", error);
  process.exit(1);
});
