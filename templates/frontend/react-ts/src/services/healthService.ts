import type { HealthInfo } from "../types/app";
import { apiGet } from "./api";

export function fetchHealth(): Promise<HealthInfo> {
  return apiGet<HealthInfo>("/health");
}
