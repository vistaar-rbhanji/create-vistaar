/**
 * Auth routes stub for {{PACKAGE_NAME}}-api.
 * Mount under /auth — no real JWT verification yet.
 */
export function registerAuthRoutes(app) {
  app.post("/auth/login", (_req, res) => {
    res.status(501).json({ message: "Auth login not implemented yet" });
  });

  app.post("/auth/register", (_req, res) => {
    res.status(501).json({ message: "Auth register not implemented yet" });
  });

  app.get("/auth/me", (_req, res) => {
    res.status(501).json({ message: "Auth session not implemented yet" });
  });

  app.post("/auth/logout", (_req, res) => {
    res.status(501).json({ message: "Auth logout not implemented yet" });
  });
}
