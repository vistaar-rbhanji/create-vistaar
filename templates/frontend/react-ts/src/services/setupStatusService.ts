import type { SetupStatus } from "../types/app";
import { apiGet } from "./api";

export function fetchSetupStatus(): Promise<SetupStatus> {
  return apiGet<SetupStatus>("/setup-status");
}
