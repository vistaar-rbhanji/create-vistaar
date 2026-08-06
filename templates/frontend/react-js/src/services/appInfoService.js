import { apiGet } from "./api";

export function fetchAppInfo() {
  return apiGet("/app-info");
}
