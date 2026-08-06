import { apiGet } from "./api";

export function fetchSetupStatus() {
  return apiGet("/setup-status");
}
