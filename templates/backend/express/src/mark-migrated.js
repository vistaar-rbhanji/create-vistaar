// Standalone entry point invoked by ORM `db:migrate` scripts (e.g. `node
// src/mark-migrated.js`) so the Setup Wizard can detect a completed
// migration without parsing tool-specific output.
import { mark } from "./mark-setup.js";

mark("migrated");
