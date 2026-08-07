export interface AppInfo {
  id: string;
  projectName: string;
  frontend: string;
  backend: string;
  database: string;
  orm: string;
  uiFramework: string;
  authentication: string; // "Disabled" | "Base Auth" | legacy "Enabled"
  docker: string;
  createdAt: string;
}

export type ServiceState = "connected" | "disconnected" | "not_configured";
export type HealthStatus = "healthy" | "degraded";

export interface HealthInfo {
  server: "running" | "stopped";
  database: ServiceState;
  status: HealthStatus;
  api: "working" | "down";
}

export interface SetupStatusCommands {
  createDb: string;
  createDbSql: string;
  migrate: string;
  seed: string;
  setup: string;
  docker: string;
  doctor: string;
  login?: string;
}

export interface DatabaseHint {
  title: string;
  steps: string[];
  technical: string | null;
}

export interface SetupStatus {
  projectGenerated: boolean;
  projectName: string;
  frontend?: string;
  backend?: string;
  databaseEngine: string;
  databaseRequired: boolean;
  databaseConfigured: boolean;
  databaseConnected: boolean;
  databaseHint?: DatabaseHint | null;
  requiredEnvVar?: string | null;
  migrationCompleted: boolean;
  seedCompleted: boolean;
  backendRunning: boolean;
  frontendRunning: boolean;
  dockerEnabled: boolean;
  authenticationEnabled: boolean;
  authentication?: string;
  authenticationInstalled?: boolean;
  authMigrationCompleted?: boolean;
  initialAdminPending?: boolean;
  initialAdminCreated?: boolean;
  setupComplete: boolean;
  dbName: string;
  commands: SetupStatusCommands;
}
