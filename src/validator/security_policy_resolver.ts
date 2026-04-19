/**
 * Pure resolver functions and pattern definitions for SecurityPolicy.
 *
 * @purpose Centralize the mapping between (category × level) and the regex
 * pattern used to enforce it, plus the policy resolution algorithm that
 * merges global + per-option policies according to the value `kind`.
 *
 * @intent Keep SecurityValidator free of policy-merging branching by
 * exposing only pure functions here.
 *
 * @reason Pure functions are trivially unit-testable and have no side
 * effects, which matches the security-critical nature of the code.
 */

import type {
  Level,
  SecurityCategory,
  SecurityCategoryLevels,
  SecurityPolicy,
  ValueKind,
} from '../types/custom_config.ts';

/**
 * Authoritative ordered list of every supported security category.
 *
 * @intent Ordering defines first-hit-wins evaluation order in the validator.
 */
export const ALL_CATEGORIES: ReadonlyArray<SecurityCategory> = [
  'shellInjection',
  'absolutePath',
  'homeExpansion',
  'parentTraversal',
  'specialChars',
] as const;

/**
 * Categories that require a value with `kind === 'path'` to be evaluated.
 *
 * @reason When `kind` is not `'path'`, these categories are forced to `'off'`
 * by `resolveEffectivePolicy`.
 */
const PATH_ONLY_CATEGORIES: ReadonlyArray<SecurityCategory> = [
  'absolutePath',
  'homeExpansion',
  'parentTraversal',
  'specialChars',
] as const;

/**
 * Default security level applied when neither global nor per-option policy
 * specifies a value for a category.
 */
const DEFAULT_FALLBACK_LEVEL: Level = 'safe';

/**
 * Regex map: category × level → pattern. `null` means the category at this
 * level performs no check (i.e. `'off'`).
 *
 * @reason See design.md §5 for the rationale of each pattern.
 */
export const CATEGORY_PATTERNS: Readonly<
  Record<SecurityCategory, Readonly<Record<Level, RegExp | null>>>
> = {
  shellInjection: {
    off: null,
    safe: /[;|&<>]/,
    strict: /[;|&<>`$\n\r]|\$\(/,
  },
  absolutePath: {
    off: null,
    safe: /^\/(?!\/)/,
    strict: /^(\/|[A-Za-z]:[\/\\]|\\\\[^\\]+\\)/,
  },
  homeExpansion: {
    off: null,
    safe: /^~(?:\/|$)/,
    strict: /^~/,
  },
  parentTraversal: {
    off: null,
    safe: /\.\.[\/\\]|\.\.$/,
    strict: /\.\.[\/\\]|\.\.$|%2[Ee]%2[Ee]|%2[Ee]\.|\.%2[Ee]/,
  },
  specialChars: {
    off: null,
    // deno-lint-ignore no-control-regex
    safe: /[\x00-\x1F\x7F]/,
    // deno-lint-ignore no-control-regex
    strict: /[\x00-\x1F\x7F-\x9F]/,
  },
} as const;

/**
 * Effective per-category levels after policy resolution.
 */
export type EffectivePolicy = Record<SecurityCategory, Level>;

/**
 * Expand a {@link SecurityPolicy} into a fully populated category → level map.
 *
 * @param policy - Source policy. May be `undefined` (use fallback for all),
 *   a single `Level` (apply to every category), or a partial map.
 * @param fallback - Level used to fill categories that the policy does not
 *   specify.
 * @returns Fully populated map covering every category in {@link ALL_CATEGORIES}.
 */
export function expandPolicy(
  policy: SecurityPolicy | undefined,
  fallback: Level,
): EffectivePolicy {
  if (policy === undefined) {
    return buildUniformLevels(fallback);
  }
  if (typeof policy === 'string') {
    return buildUniformLevels(policy);
  }
  return buildLevelsWithFallback(policy, fallback);
}

/**
 * Combine the global policy with an optional per-option override and apply
 * `kind`-based scoping.
 *
 * Resolution order:
 * 1. Expand the global policy with `'safe'` as the universal fallback.
 * 2. If a per-option policy exists, override matching categories.
 * 3. If `kind` is not `'path'`, force the four path categories to `'off'`.
 *
 * @reason `shellInjection` is intentionally global — Phase 1 cannot see
 * option identity, so per-option overrides for it have no Phase 1 effect.
 * The function still allows it to appear in `perOptionPolicy` (it would
 * apply at Phase 2, but Phase 2 is path-only — net effect is none).
 *
 * @param globalPolicy - Top-level `CustomConfig.security.policy`.
 * @param perOptionPolicy - Optional per-option `securityPolicy` override.
 * @param kind - Value classification of the option (`undefined` is treated
 *   as `'text'`).
 * @returns Effective per-category levels for this specific value.
 */
export function resolveEffectivePolicy(
  globalPolicy: SecurityPolicy | undefined,
  perOptionPolicy: SecurityPolicy | undefined,
  kind: ValueKind | undefined,
): EffectivePolicy {
  const globalLevels = expandPolicy(globalPolicy, DEFAULT_FALLBACK_LEVEL);
  let effective: EffectivePolicy;
  if (perOptionPolicy === undefined) {
    effective = { ...globalLevels };
  } else if (typeof perOptionPolicy === 'string') {
    effective = buildUniformLevels(perOptionPolicy);
  } else {
    effective = { ...globalLevels };
    for (const category of ALL_CATEGORIES) {
      const override = perOptionPolicy[category];
      if (override !== undefined) {
        effective[category] = override;
      }
    }
  }

  if (kind !== 'path') {
    for (const category of PATH_ONLY_CATEGORIES) {
      effective[category] = 'off';
    }
  }
  return effective;
}

/**
 * Build a level map where every category is set to the same level.
 */
function buildUniformLevels(level: Level): EffectivePolicy {
  const out: Partial<EffectivePolicy> = {};
  for (const category of ALL_CATEGORIES) {
    out[category] = level;
  }
  return out as EffectivePolicy;
}

/**
 * Build a level map by taking values from `policy`, falling back to `fallback`
 * for any unset category.
 */
function buildLevelsWithFallback(
  policy: SecurityCategoryLevels,
  fallback: Level,
): EffectivePolicy {
  const out: Partial<EffectivePolicy> = {};
  for (const category of ALL_CATEGORIES) {
    const level = policy[category];
    out[category] = level ?? fallback;
  }
  return out as EffectivePolicy;
}
