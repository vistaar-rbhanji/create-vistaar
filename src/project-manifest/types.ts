/**
 * Persistent project manifest (`vistaar.json`) — Phase 14.
 */

export const VISTAAR_MANIFEST_VERSION = 1 as const;

export interface VistaarModuleEntry {
  name: string;
  version: string;
}

export interface VistaarProjectManifest {
  version: typeof VISTAAR_MANIFEST_VERSION;
  project: {
    name: string;
  };
  frontend: {
    framework: "react";
    language: "typescript" | "javascript";
    ui: "shadcn" | "bootstrap" | "material-ui";
  };
  backend: { framework: "express" | "fastapi" } | null;
  database: { type: "postgresql" | "mongodb" } | null;
  orm: { name: "prisma" | "drizzle" | "mongoose" } | null;
  modules: Record<string, VistaarModuleEntry>;
}
