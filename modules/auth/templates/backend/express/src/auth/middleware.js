/**
 * Express middleware stub — protect routes after you implement verifyToken.
 */
export function requireAuth(_req, res, next) {
  res.status(501).json({ message: "requireAuth not implemented yet" });
  // next();
}
