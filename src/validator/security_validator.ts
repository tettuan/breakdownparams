import { BaseValidator } from './params/base_validator.ts';
import type { ValidationResult } from '../types/validation_result.ts';
import type {
  CustomConfig,
  OptionDefinition,
  SecurityCategory,
  SecurityPolicy,
  ValueKind,
} from '../types/custom_config.ts';
import {
  ALL_CATEGORIES,
  CATEGORY_PATTERNS,
  type EffectivePolicy,
  resolveEffectivePolicy,
} from './security_policy_resolver.ts';

/**
 * Prefix used by user-variable options (`--uv-*`).
 *
 * @reason User variable values are template variables, not paths or shell
 * fragments. They are still subject to Phase 1 shellInjection checks but
 * are never evaluated against the four path categories.
 */
const USER_VARIABLE_PREFIX = '--uv-';

/**
 * Error code emitted for any security violation.
 */
const SECURITY_ERROR_CODE = 'SECURITY_ERROR';

/**
 * Error category emitted for any security violation.
 */
const SECURITY_ERROR_CATEGORY = 'security';

/**
 * Phase 2 input shape passed by ParamsParser after option resolution.
 *
 * @intent Allows the validator to enforce per-option, kind-aware policies
 * without re-parsing argument syntax.
 */
export interface Phase2ResolvedOption {
  /** Resolved value (right side of `=`, or the full arg for `--uv-*`). */
  value: string;
  /** Original raw argument as it appeared on the command line. */
  rawArg: string;
  /** True when the option originated from `--uv-*`. */
  isUserVariable: boolean;
}

/**
 * Structured Phase 2 input.
 *
 * @property positionalParams - Bare positional arguments (no leading dash).
 * @property resolvedOptions - Map keyed by canonical option name (e.g.
 *   `from`) to resolved value metadata.
 */
export interface Phase2Input {
  positionalParams: string[];
  resolvedOptions: Map<string, Phase2ResolvedOption>;
}

/**
 * Two-phase security validator.
 *
 * Phase 1 runs against raw command-line arguments before option resolution
 * and enforces only `shellInjection` (the only category that can be
 * evaluated without knowing option identity).
 *
 * Phase 2 runs after option resolution and enforces the four path
 * categories (`absolutePath`, `homeExpansion`, `parentTraversal`,
 * `specialChars`) on values whose option `kind` is `'path'`. Per-option
 * `securityPolicy` overrides are applied here.
 *
 * The legacy {@link validate} method runs both phases sequentially against
 * a flat argument array; it is retained for standalone tests and ad-hoc
 * usage where option metadata is not available.
 *
 * @extends BaseValidator
 */
export class SecurityValidator extends BaseValidator {
  private readonly customConfig: CustomConfig | undefined;
  private readonly globalPolicy: SecurityPolicy | undefined;
  private readonly valueOptionDefs: Record<string, OptionDefinition>;

  /**
   * @param customConfig - Optional CustomConfig. When omitted, the validator
   *   behaves as if `{ security: { policy: 'safe' } }` was supplied with the
   *   built-in `from`/`destination` defaulted to `kind: 'path'` and other
   *   value options defaulted to `kind: 'text'`.
   */
  constructor(customConfig?: CustomConfig) {
    super();
    this.customConfig = customConfig;
    this.globalPolicy = customConfig?.security?.policy;
    this.valueOptionDefs = customConfig?.options?.values ?? {};
  }

  /**
   * Phase 1: shellInjection check against raw arguments.
   *
   * @param args - Raw command-line arguments as received by ParamsParser.
   * @returns Validation result. On success, `validatedParams` echoes the
   *   input. On failure, `errorMessage` follows the format
   *   `Security error: shellInjection violation in <context>`.
   */
  public validatePhase1(args: string[]): ValidationResult {
    const policy = resolveEffectivePolicy(this.globalPolicy, undefined, 'text');
    const level = policy.shellInjection;
    const pattern = CATEGORY_PATTERNS.shellInjection[level];
    if (pattern === null) {
      return successResult(args);
    }
    for (const arg of args) {
      if (pattern.test(arg)) {
        return failureResult(
          args,
          buildErrorMessage('shellInjection', describeRawArgContext(arg)),
        );
      }
    }
    return successResult(args);
  }

  /**
   * Phase 2: path-category checks on resolved option values.
   *
   * @param input - Resolved positional + option metadata produced by
   *   ParamsParser after option-factory parsing.
   * @returns Validation result. Positional params and `--uv-*` values are
   *   not subject to path checks (no `kind` association). Any rejected
   *   value yields an error message of the form
   *   `Security error: <category> violation in <context>`.
   */
  public validatePhase2(input: Phase2Input): ValidationResult {
    // Positional params have no kind association; they get only the global
    // shellInjection check, which Phase 1 already covered. Nothing to do
    // for positionals here.

    for (const [optionName, resolved] of input.resolvedOptions) {
      if (resolved.isUserVariable) {
        // User variables are not paths; Phase 1 handled their shellInjection.
        continue;
      }
      const def = this.valueOptionDefs[optionName];
      const kind: ValueKind = def?.kind ?? 'text';
      const perOptionPolicy = def?.securityPolicy;
      const effective = resolveEffectivePolicy(
        this.globalPolicy,
        perOptionPolicy,
        kind,
      );
      const violation = firstCategoryViolation(resolved.value, effective);
      if (violation !== null) {
        return failureResult(
          collectAllValues(input),
          buildErrorMessage(violation, `option ${optionName}`),
        );
      }
    }
    return successResult(collectAllValues(input));
  }

  /**
   * Legacy single-call validation entry point.
   *
   * Runs Phase 1 against `args`, then Phase 2 against a synthesized input
   * that treats every non-flag/non-uv arg as positional. Without option
   * metadata, Phase 2 here cannot enforce path categories on resolved value
   * options — callers that need that should use the explicit two-phase API
   * via ParamsParser.
   *
   * For backward compatibility with v1.2.x tests, this method also enforces
   * the safe-level `parentTraversal` pattern on every argument that does
   * not start with `--uv-`. This mirrors the v1.2.x default behaviour where
   * positional args were checked for traversal globally.
   *
   * @param args - Raw command-line arguments.
   * @returns Validation result.
   */
  public validate(args: string[]): ValidationResult {
    const phase1 = this.validatePhase1(args);
    if (!phase1.isValid) return phase1;

    // Backward-compat traversal check: applies only when the validator
    // was constructed without an explicit CustomConfig (i.e. legacy
    // standalone usage). When CustomConfig is supplied, callers are
    // expected to drive the explicit two-phase API via ParamsParser.
    if (this.customConfig === undefined) {
      const traversalPattern = CATEGORY_PATTERNS.parentTraversal.safe;
      if (traversalPattern !== null) {
        for (const arg of args) {
          if (arg.startsWith(USER_VARIABLE_PREFIX)) continue;
          if (traversalPattern.test(arg)) {
            return failureResult(
              args,
              buildErrorMessage('parentTraversal', describeRawArgContext(arg)),
            );
          }
        }
      }
    }

    return successResult(args);
  }
}

/**
 * Describe a raw argument's context for inclusion in an error message.
 *
 * @returns `option <name>` for `--name=...` / `-x=...`, `argument` for
 *   `--uv-*`, otherwise `positional`.
 */
function describeRawArgContext(arg: string): string {
  if (arg.startsWith(USER_VARIABLE_PREFIX)) {
    return 'argument';
  }
  if (arg.startsWith('--')) {
    const head = arg.slice(2).split('=')[0];
    return head.length > 0 ? `option ${head}` : 'argument';
  }
  if (arg.startsWith('-')) {
    const head = arg.slice(1).split('=')[0];
    return head.length > 0 ? `option ${head}` : 'argument';
  }
  return 'positional';
}

/**
 * Walk categories in {@link ALL_CATEGORIES} order; return the first one whose
 * level is non-`'off'` and whose pattern matches `value`. Returns `null` when
 * no category triggers.
 */
function firstCategoryViolation(
  value: string,
  effective: EffectivePolicy,
): SecurityCategory | null {
  for (const category of ALL_CATEGORIES) {
    const level = effective[category];
    const pattern = CATEGORY_PATTERNS[category][level];
    if (pattern === null) continue;
    if (pattern.test(value)) {
      return category;
    }
  }
  return null;
}

/**
 * Build the canonical security error message.
 *
 * @reason Exported as {@link formatSecurityError} so tests can assert against
 * the same template the validator produces. This eliminates test-side string
 * duplication and keeps the message format under a single source of truth.
 */
function buildErrorMessage(category: SecurityCategory, context: string): string {
  return `Security error: ${category} violation in ${context}`;
}

/**
 * Public alias for {@link buildErrorMessage}.
 *
 * @intent Single source of truth for the security error message template.
 *   Production code uses this to produce `errorMessage`; tests use it to
 *   derive expected values without duplicating the format string.
 */
export function formatSecurityError(category: SecurityCategory, context: string): string {
  return buildErrorMessage(category, context);
}

/**
 * Public security error code.
 *
 * @intent Re-export of {@link SECURITY_ERROR_CODE} so tests can derive the
 *   expected `errorCode` instead of hardcoding the string.
 */
export const SECURITY_ERROR_CODE_VALUE = SECURITY_ERROR_CODE;

/**
 * Public security error category.
 *
 * @intent Re-export of {@link SECURITY_ERROR_CATEGORY} so tests can derive the
 *   expected `errorCategory` instead of hardcoding the string.
 */
export const SECURITY_ERROR_CATEGORY_VALUE = SECURITY_ERROR_CATEGORY;

/**
 * Build a successful ValidationResult with the given echoed params.
 */
function successResult(params: string[]): ValidationResult {
  return {
    isValid: true,
    validatedParams: params,
    errors: [],
  };
}

/**
 * Build a failing ValidationResult with the canonical error fields.
 */
function failureResult(params: string[], message: string): ValidationResult {
  return {
    isValid: false,
    validatedParams: params,
    errorMessage: message,
    errorCode: SECURITY_ERROR_CODE,
    errorCategory: SECURITY_ERROR_CATEGORY,
  };
}

/**
 * Flatten Phase2Input back into a string array for `validatedParams`.
 *
 * @reason ValidationResult requires `validatedParams: string[]`. We echo
 * positional params and raw option args.
 */
function collectAllValues(input: Phase2Input): string[] {
  const out: string[] = [...input.positionalParams];
  for (const [, resolved] of input.resolvedOptions) {
    out.push(resolved.rawArg);
  }
  return out;
}
