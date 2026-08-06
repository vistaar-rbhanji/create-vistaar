// Baked in at generation time so root-level scripts stay aware of the
// selected stack without re-reading CLI answers at runtime.
export const PROJECT_NAME = "{{PROJECT_NAME}}";
export const BACKEND = "{{BACKEND}}";
export const DATABASE = "{{DATABASE}}";
export const DB_DRIVER = "{{DB_DRIVER}}";
export const ORM = "{{ORM}}";
export const DB_NAME = "{{DB_NAME}}";
export const BACKEND_PORT = "{{BACKEND_PORT}}";
export const API_URL = "{{API_URL}}";
export const FRONTEND_URL = "{{FRONTEND_URL}}";
export const DOCKER_ENABLED = "{{DOCKER_BOOL}}" === "true";
export const AUTHENTICATION_ENABLED = "{{AUTHENTICATION_BOOL}}" === "true";

export const isNodeBackend = BACKEND === "Express";
export const isPythonBackend = BACKEND === "FastAPI";
export const databaseRequired = DATABASE !== "None";
