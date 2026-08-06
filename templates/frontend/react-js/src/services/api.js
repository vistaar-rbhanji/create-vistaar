import { API_BASE_URL } from "./config";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiGet(path) {
  let response;

  try {
    response = await fetch(API_BASE_URL + path);
  } catch {
    throw new ApiError("Cannot connect to backend.");
  }

  if (!response.ok) {
    throw new ApiError(
      "Request to " + path + " failed with status " + response.status + ".",
      response.status,
    );
  }

  return response.json();
}
