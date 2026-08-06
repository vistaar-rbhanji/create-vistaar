import type { AppInfo } from "../types/app";
import { apiGet } from "./api";

export function fetchAppInfo(): Promise<AppInfo> {
  return apiGet<AppInfo>("/app-info");
}
