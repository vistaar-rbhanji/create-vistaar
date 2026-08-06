import { apiGet } from "./api";

export function fetchHealth() {
  return apiGet("/health");
}
