import { API_BASE_URL } from "./config";

export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  let response: Response;

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

  return (await response.json()) as T;
}
