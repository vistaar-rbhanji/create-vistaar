/**
 * Base Auth module installer.
 *
 * Source of truth for auth behavior: ../base-auth (do not recreate logic here).
 * This installer validates compatibility, copies base-auth into the project,
 * injects a UI-framework adapter, and wires routing — using the shared
 * ModuleContext / helpers API (not a parallel install system).
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import fs from "fs-extra";

/**
 * @typedef {import("../../src/module-system/types.ts").ModuleContext} ModuleContext
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SKIP_DIR_NAMES = new Set([
  "node_modules",
  "dist",
  ".git",
  ".husky",
  ".vscode",
]);

const SKIP_FILE_NAMES = new Set([".env", "package-lock.json"]);

/** @param {ModuleContext} context */
export async function install(context) {
  assertCompatible(context);

  const baseAuthRoot = path.join(context.moduleRoot, "..", "base-auth");
  if (!(await fs.pathExists(baseAuthRoot))) {
    throw new Error(
      "Authentication could not be installed.\n" +
        "Reason: modules/base-auth was not found next to modules/auth.\n" +
        `Expected: ${baseAuthRoot}`,
    );
  }

  await context.helpers.standardInstall(context);

  await copyAuthFrontendLibrary(context, baseAuthRoot);
  await copyUiAdapter(context);
  await writeAuthShell(context);
  await patchFrontendApp(context);
  await patchViteConfig(context);
  await patchTsconfigPaths(context);
  await copyAuthApi(context, baseAuthRoot);
  await mergeFrontendAuthDeps(context);
  await patchRootScripts(context);
  await appendAuthApiEnvExample(context);
  await patchWelcomeAuthBadge(context);

  const { logger } = await loadLogger();
  logger.success("  Base Auth installed from modules/base-auth");
  logger.info(
    `  • auth-api/  — OTP + JWT API (port ${context.variables.AUTH_API_PORT || "5000"})`,
  );
  logger.info("  • frontend/src/auth — UI-agnostic auth library + adapter");
  logger.info("  • Main backend kept for setup/welcome (app-info / health)");
  logger.warn(
    "  Base Auth needs PostgreSQL, Redis, and mail (see auth-api/.env.example).",
  );
}

/** @param {ModuleContext} context */
function assertCompatible(context) {
  const { backend, database, authentication } = context.config;
  if (authentication !== "base-auth") {
    throw new Error(
      "Authentication could not be installed.\n" +
        "Reason: auth module enabled without authentication=base-auth.",
    );
  }
  if (backend !== "express" || database !== "postgresql") {
    throw new Error(
      "Authentication could not be installed.\n" +
        `Reason: Base Auth is not compatible with ${backend} + ${database}.\n` +
        "Base Auth requires Express + PostgreSQL.",
    );
  }
}

async function loadLogger() {
  try {
    return await import("../../src/utils/logger.js");
  } catch {
    return {
      logger: {
        info: console.log,
        success: console.log,
        warn: console.warn,
        error: console.error,
        title: console.log,
        blank: () => console.log(),
      },
    };
  }
}

/**
 * @param {ModuleContext} context
 * @param {string} baseAuthRoot
 */
async function copyAuthFrontendLibrary(context, baseAuthRoot) {
  const sourceSrc = path.join(baseAuthRoot, "frontend", "src");
  const destRoot = path.join(context.paths.frontend, "src", "auth");
  await fs.ensureDir(destRoot);

  const skipTop = new Set(["App.tsx", "main.tsx", "index.ts", "adapters"]);

  const entries = await fs.readdir(sourceSrc);
  for (const entry of entries) {
    if (skipTop.has(entry)) continue;
    const from = path.join(sourceSrc, entry);
    const to = path.join(destRoot, entry);
    await copyFiltered(from, to, context.variables);
  }

  // Public barrel for the host app
  const barrel = `/**
 * Base Auth — re-exports from modules/base-auth (installed copy).
 */
export type {
  VistaarAlertProps,
  VistaarButtonProps,
  VistaarCardProps,
  VistaarInputProps,
  VistaarLabelProps,
  VistaarSpinnerProps,
  VistaarUIComponents,
} from "./contract/types";
export { VistaarUIProvider, useVistaarUI } from "./contract/VistaarUI";
export { AuthProvider, useAuth } from "./contexts/AuthContext";
export type { AuthUser } from "./contexts/AuthContext";
export { default as ProtectedRoute } from "./routes/ProtectedRoute";
export { default as PublicOnlyRoute } from "./routes/PublicOnlyRoute";
export { authService } from "./services/auth.service";
export { default as DashboardPage } from "./pages/Dashboard";
export { default as LoginPage } from "./pages/Login";
export { default as VerifyOtpPage } from "./pages/VerifyOtp";
export { authUI } from "./adapters/ui";
export { default as AuthShell } from "./AuthShell";
`;
  await writeText(
    path.join(destRoot, "index.ts"),
    barrel,
    context.variables,
  );
}

/**
 * @param {ModuleContext} context
 */
async function copyUiAdapter(context) {
  const ui = context.config.uiFramework;
  const adapterDir = path.join(
    context.moduleRoot,
    "templates",
    "ui",
    ui === "bootstrap" || ui === "shadcn" || ui === "material-ui" ? ui : "native",
  );
  // Fallback to native if a variant folder is missing
  const sourceDir = (await fs.pathExists(adapterDir))
    ? adapterDir
    : path.join(context.moduleRoot, "templates", "ui", "native");

  const destDir = path.join(context.paths.frontend, "src", "auth", "adapters");
  await fs.ensureDir(destDir);
  await copyFiltered(sourceDir, path.join(destDir, "ui"), context.variables);

  // Prefer styles from base-auth native CSS for non-bootstrap as baseline
  const nativeStyles = path.join(
    context.moduleRoot,
    "..",
    "base-auth",
    "frontend",
    "src",
    "adapters",
    "native",
    "styles.css",
  );
  if (await fs.pathExists(nativeStyles)) {
    await copyFiltered(
      nativeStyles,
      path.join(destDir, "ui", "base-auth.css"),
      context.variables,
    );
  }
}

/**
 * @param {ModuleContext} context
 */
async function writeAuthShell(context) {
  const isTs = context.config.language === "typescript";
  const ext = isTs ? "tsx" : "jsx";
  const shell = `import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { VistaarUIProvider, useVistaarUI } from "./contract/VistaarUI";
import initKeys from "./crypto/handshake";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import VerifyOtp from "./pages/VerifyOtp";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import { authUI } from "./adapters/ui";
import "./adapters/ui/base-auth.css";

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  const ui = useVistaarUI();

  if (isLoading) {
    return (
      <div className="auth-center">
        <ui.Spinner label="Loading session..." />
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function AuthShell() {
  const [isHandshakeReady, setIsHandshakeReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const setupSecurity = async () => {
      try {
        await initKeys(true);
        setIsHandshakeReady(true);
      } catch (error) {
        console.error("Failed to initialize secure session", error);
        setHasError(true);
      }
    };
    setupSecurity();
  }, []);

  if (hasError) {
    return (
      <div className="auth-center">
        <p>Failed to establish a secure connection with the auth API. Is auth-api running?</p>
      </div>
    );
  }

  if (!isHandshakeReady) {
    return (
      <div className="auth-center">
        <p>Establishing secure session...</p>
      </div>
    );
  }

  return (
    <VistaarUIProvider components={authUI}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </VistaarUIProvider>
  );
}
`;
  await writeText(
    path.join(context.paths.frontend, "src", "auth", `AuthShell.${ext}`),
    shell,
    context.variables,
  );

  // Fix barrel export extension-agnostic
  if (!isTs) {
    const barrelPath = path.join(context.paths.frontend, "src", "auth", "index.js");
    await writeText(
      barrelPath,
      `export { authUI } from "./adapters/ui/index.js";
export { default as AuthShell } from "./AuthShell.jsx";
export { AuthProvider, useAuth } from "./contexts/AuthContext.tsx";
export { VistaarUIProvider, useVistaarUI } from "./contract/VistaarUI.tsx";
export { default as LoginPage } from "./pages/Login.tsx";
export { default as VerifyOtpPage } from "./pages/VerifyOtp.tsx";
export { default as DashboardPage } from "./pages/Dashboard.tsx";
`,
      context.variables,
    );
  }
}

/**
 * @param {ModuleContext} context
 */
async function patchFrontendApp(context) {
  const isTs = context.config.language === "typescript";
  const appFile = path.join(
    context.paths.frontend,
    "src",
    isTs ? "App.tsx" : "App.jsx",
  );

  const next = isTs
    ? `import { useSetupStatus } from "./hooks/useSetupStatus";
import { SetupWizardPage } from "./pages/SetupWizardPage";
import AuthShell from "./auth/AuthShell";

export default function App() {
  const { status, loading, error, refetch } = useSetupStatus();

  if (loading && !status) {
    return <div className="app-boot">Checking setup…</div>;
  }

  if (error || !status || !status.setupComplete) {
    return <SetupWizardPage status={status} error={error} onRefresh={refetch} />;
  }

  // Setup complete — Base Auth shell (login / OTP / dashboard)
  return <AuthShell />;
}
`
    : `import { useSetupStatus } from "./hooks/useSetupStatus";
import { SetupWizardPage } from "./pages/SetupWizardPage";
import AuthShell from "./auth/AuthShell.jsx";

export default function App() {
  const { status, loading, error, refetch } = useSetupStatus();

  if (loading && !status) {
    return <div className="app-boot">Checking setup…</div>;
  }

  if (error || !status || !status.setupComplete) {
    return <SetupWizardPage status={status} error={error} onRefresh={refetch} />;
  }

  return <AuthShell />;
}
`;

  await writeText(appFile, next, context.variables);
}

/**
 * @param {ModuleContext} context
 */
async function patchViteConfig(context) {
  const isTs = context.config.language === "typescript";
  const configPath = path.join(
    context.paths.frontend,
    isTs ? "vite.config.ts" : "vite.config.js",
  );

  const contents = `import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@auth": path.resolve(__dirname, "./src/auth"),
    },
  },
  server: {
    proxy: {
      // Vistaar setup / welcome API (main backend)
      "/api/app-info": {
        target: "http://localhost:{{BACKEND_PORT}}",
        changeOrigin: true,
      },
      "/api/health": {
        target: "http://localhost:{{BACKEND_PORT}}",
        changeOrigin: true,
      },
      "/api/setup-status": {
        target: "http://localhost:{{BACKEND_PORT}}",
        changeOrigin: true,
      },
      // Base Auth API (auth-api service)
      "/api/auth": {
        target: "http://localhost:{{AUTH_API_PORT}}",
        changeOrigin: true,
      },
      "/api/crypto": {
        target: "http://localhost:{{AUTH_API_PORT}}",
        changeOrigin: true,
      },
    },
  },
});
`;
  await writeText(configPath, contents, context.variables);

  // Point auth client at same-origin /api via empty host so Vite proxy works
  const apiFile = path.join(
    context.paths.frontend,
    "src",
    "auth",
    "utils",
    "api.ts",
  );
  if (await fs.pathExists(apiFile)) {
    let api = await fs.readFile(apiFile, "utf8");
    api = api.replace(
      "const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;",
      'const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || ""}/api`;',
    );
    await writeText(apiFile, api, context.variables);
  }

  const handshake = path.join(
    context.paths.frontend,
    "src",
    "auth",
    "crypto",
    "handshake.ts",
  );
  if (await fs.pathExists(handshake)) {
    let text = await fs.readFile(handshake, "utf8");
    text = text.replace(
      /http:\/\/localhost:5000/g,
      "",
    );
    // Ensure VITE_API_BASE_URL fallback is empty string for proxy
    text = text.replace(
      /import\.meta\.env\.VITE_API_BASE_URL\s*\|\|\s*["'][^"']*["']/g,
      'import.meta.env.VITE_API_BASE_URL || ""',
    );
    await writeText(handshake, text, context.variables);
  }
}

/**
 * @param {ModuleContext} context
 */
async function patchTsconfigPaths(context) {
  if (context.config.language !== "typescript") return;
  const tsconfigPath = path.join(context.paths.frontend, "tsconfig.json");
  if (!(await fs.pathExists(tsconfigPath))) return;

  const tsconfig = await fs.readJson(tsconfigPath);
  tsconfig.compilerOptions = tsconfig.compilerOptions || {};
  tsconfig.compilerOptions.baseUrl = tsconfig.compilerOptions.baseUrl || ".";
  tsconfig.compilerOptions.paths = {
    ...(tsconfig.compilerOptions.paths || {}),
    "@auth/*": ["src/auth/*"],
  };
  await fs.writeJson(tsconfigPath, tsconfig, { spaces: 2 });
}

/**
 * @param {ModuleContext} context
 * @param {string} baseAuthRoot
 */
async function copyAuthApi(context, baseAuthRoot) {
  const dest = path.join(context.projectPath, "auth-api");
  const source = path.join(baseAuthRoot, "backend");
  await fs.ensureDir(dest);
  await copyFiltered(source, dest, context.variables, {
    rewriteEnvExample: true,
  });

  // Ensure .env is not copied; write sanitized .env.example with placeholders
  const envExamplePath = path.join(dest, ".env.example");
  const envExample = `PORT={{AUTH_API_PORT}}

DATABASE_URL=postgresql://username:password@localhost:5432/{{DB_NAME}}
NODE_ENV=development

JWT_SECRET=change-me-generate-a-long-secret
TOKEN_REGISTER_EXPIRY=in_milliseconds
TOKEN_ACCESS_EXPIRY=in_milliseconds
TOKEN_REFRESH_EXPIRY=in_milliseconds
OTP_EXPIRY_MS=600000

CLIENT_ID_EXPIRES_AT=1800000

FRONTEND_URL={{FRONTEND_URL}}

REDIS_URL=redis://localhost:6379
REDIS_DB=1
# REDIS_PASSWORD=

# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
DB_MASTER_KEY=your_64_char_hex_key_here
DB_HASH_KEY=your_64_char_hex_key_here

MAIL_MAILER=smtp
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME={{PROJECT_NAME}}
MAIL_DEV_LOG_OTP=true
`;
  await writeText(envExamplePath, envExample, context.variables);

  // Soft-patch branding title to project name where safe
  const branding = path.join(dest, "src", "services", "mail-templates", "branding.ts");
  if (await fs.pathExists(branding)) {
    let text = await fs.readFile(branding, "utf8");
    text = text.replace(/Vistaar Auth/g, "{{PROJECT_NAME}}");
    await writeText(branding, text, context.variables);
  }

  // Drop husky prepare — scaffolded apps don't ship .husky; it breaks npm install.
  const authPkgPath = path.join(dest, "package.json");
  if (await fs.pathExists(authPkgPath)) {
    const authPkg = await fs.readJson(authPkgPath);
    if (authPkg.scripts?.prepare === "husky") {
      delete authPkg.scripts.prepare;
    }
    if (authPkg.devDependencies?.husky) {
      delete authPkg.devDependencies.husky;
    }
    await fs.writeJson(authPkgPath, authPkg, { spaces: 2 });
  }
}

/**
 * @param {ModuleContext} context
 */
async function mergeFrontendAuthDeps(context) {
  const pkgPath = path.join(context.paths.frontend, "package.json");
  if (!(await fs.pathExists(pkgPath))) return;
  const pkg = await fs.readJson(pkgPath);
  pkg.dependencies = {
    ...(pkg.dependencies || {}),
    axios: "^1.13.6",
    "react-router-dom": "^7.13.1",
    zod: "^4.3.6",
  };
  if (context.config.language === "javascript") {
    pkg.devDependencies = {
      ...(pkg.devDependencies || {}),
      typescript: pkg.devDependencies?.typescript || "^5.7.2",
    };
  }
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });
}

/**
 * @param {ModuleContext} context
 */
async function patchRootScripts(context) {
  const pkgPath = path.join(context.projectPath, "package.json");
  if (!(await fs.pathExists(pkgPath))) return;
  const pkg = await fs.readJson(pkgPath);

  // Portable init script (Windows-safe — does not use psql "$DATABASE_URL")
  const scriptsDir = path.join(context.projectPath, "scripts");
  await fs.ensureDir(scriptsDir);
  const initSrc = path.join(
    context.moduleRoot,
    "templates",
    "root-scripts",
    "auth-init-db.js",
  );
  if (await fs.pathExists(initSrc)) {
    await fs.copy(initSrc, path.join(scriptsDir, "auth-init-db.js"));
  }

  pkg.scripts = {
    ...(pkg.scripts || {}),
    "dev:auth-api": "npm run dev --prefix auth-api",
    "auth:init-db": "node scripts/auth-init-db.js",
    "auth:create-admin": "npm run create:admin --prefix auth-api",
  };
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });
}

/**
 * @param {ModuleContext} context
 */
async function appendAuthApiEnvExample(context) {
  // Already written into auth-api/.env.example
  const frontendEnv = path.join(context.paths.frontend, ".env.example");
  const line = "VITE_API_BASE_URL=";
  if (await fs.pathExists(frontendEnv)) {
    let text = await fs.readFile(frontendEnv, "utf8");
    if (!text.includes("VITE_API_BASE_URL")) {
      text += `\n# Empty = same-origin (Vite proxies /api/auth to auth-api)\n${line}\n`;
      await writeText(frontendEnv, text, context.variables);
    }
  } else {
    await writeText(
      frontendEnv,
      `# Empty = same-origin (Vite proxies /api/auth to auth-api)\n${line}\n`,
      context.variables,
    );
  }
}

/**
 * @param {ModuleContext} context
 */
async function patchWelcomeAuthBadge(context) {
  // Welcome is replaced by AuthShell after setup; setup-status already
  // surfaces authenticationEnabled from seed {{AUTHENTICATION}}.
  // Keep welcome components intact for pre-auth setup UX.
  void context;
}

/**
 * @param {string} source
 * @param {string} dest
 * @param {Record<string, string>} variables
 * @param {{ rewriteEnvExample?: boolean }} [options]
 */
async function copyFiltered(source, dest, variables, options = {}) {
  const stat = await fs.stat(source);
  if (stat.isFile()) {
    await fs.ensureDir(path.dirname(dest));
    if (isBinary(source)) {
      await fs.copy(source, dest);
      return;
    }
    let text = await fs.readFile(source, "utf8");
    text = rewriteAuthImports(text);
    text = applyVars(text, variables);
    await fs.writeFile(dest, text, "utf8");
    return;
  }

  await fs.ensureDir(dest);
  const entries = await fs.readdir(source);
  for (const entry of entries) {
    if (SKIP_DIR_NAMES.has(entry) || SKIP_FILE_NAMES.has(entry)) continue;
    if (entry === ".env.example" && options.rewriteEnvExample) {
      // caller writes sanitized env example
      continue;
    }
    await copyFiltered(
      path.join(source, entry),
      path.join(dest, entry),
      variables,
      options,
    );
  }
}

/** @param {string} text */
function rewriteAuthImports(text) {
  return text
    .replace(/from\s+["']@\//g, 'from "@auth/')
    .replace(/from\s+['']@\//g, "from '@auth/");
}

/**
 * @param {string} text
 * @param {Record<string, string>} variables
 */
function applyVars(text, variables) {
  return text.replace(/\{\{\s*([A-Z0-9_]+)\s*\}\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(variables, key)) {
      return variables[key] ?? match;
    }
    return match;
  });
}

/**
 * @param {string} filePath
 * @param {string} contents
 * @param {Record<string, string>} variables
 */
async function writeText(filePath, contents, variables) {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, applyVars(contents, variables), "utf8");
}

/** @param {string} filePath */
function isBinary(filePath) {
  return /\.(png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot|pdf|zip)$/i.test(filePath);
}
