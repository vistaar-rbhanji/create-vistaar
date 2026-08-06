/**
 * Password / token helper placeholders for {{PACKAGE_NAME}}.
 * Installs jsonwebtoken + bcryptjs via module.json — implement later.
 */
export async function hashPassword(_password) {
  throw new Error("hashPassword not implemented");
}

export async function verifyPassword(_password, _hash) {
  throw new Error("verifyPassword not implemented");
}

export function signToken(_payload) {
  throw new Error("signToken not implemented");
}

export function verifyToken(_token) {
  throw new Error("verifyToken not implemented");
}
