/**
 * Deep-ish merge for package.json overlays (UI → frontend, modules → apps).
 *
 * Architectural decision:
 * Generators own *when* to merge; this util owns *how*. Keeping merge logic
 * out of TemplateEngine preserves SRP — the engine copies trees, merge policy
 * stays with composition layers that understand npm manifests.
 */

export interface PackageJsonLike {
  name?: string;
  version?: string;
  private?: boolean;
  type?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  [key: string]: unknown;
}

function mergeRecord(
  base: Record<string, string> | undefined,
  overlay: Record<string, string> | undefined,
): Record<string, string> | undefined {
  if (!base && !overlay) {
    return undefined;
  }
  return { ...base, ...overlay };
}

/**
 * Merge `overlay` onto `base`.
 * - Top-level scalar fields from overlay win, except `name` / `version`
 *   which stay on the base project when already set.
 * - `scripts` and dependency maps are shallow-merged (overlay keys win).
 */
export function mergePackageJson(
  base: PackageJsonLike,
  overlay: PackageJsonLike,
): PackageJsonLike {
  const merged: PackageJsonLike = { ...base, ...overlay };

  if (base.name !== undefined) {
    merged.name = base.name;
  } else if (overlay.name !== undefined) {
    merged.name = overlay.name;
  }

  if (base.version !== undefined) {
    merged.version = base.version;
  } else if (overlay.version !== undefined) {
    merged.version = overlay.version;
  }

  const scripts = mergeRecord(base.scripts, overlay.scripts);
  const dependencies = mergeRecord(base.dependencies, overlay.dependencies);
  const devDependencies = mergeRecord(
    base.devDependencies,
    overlay.devDependencies,
  );
  const peerDependencies = mergeRecord(
    base.peerDependencies,
    overlay.peerDependencies,
  );
  const optionalDependencies = mergeRecord(
    base.optionalDependencies,
    overlay.optionalDependencies,
  );

  if (scripts) {
    merged.scripts = scripts;
  }
  if (dependencies) {
    merged.dependencies = dependencies;
  }
  if (devDependencies) {
    merged.devDependencies = devDependencies;
  }
  if (peerDependencies) {
    merged.peerDependencies = peerDependencies;
  }
  if (optionalDependencies) {
    merged.optionalDependencies = optionalDependencies;
  }

  return merged;
}
