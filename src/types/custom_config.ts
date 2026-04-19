/**
 * Custom configuration types for breakdownparams
 */

/**
 * Directive type configuration
 */
export interface DirectiveTypeConfig {
  pattern: string;
  errorMessage: string;
}

/**
 * Layer type configuration
 */
export interface LayerTypeConfig {
  pattern: string;
  errorMessage: string;
}

/**
 * Parameter configuration for two-parameter mode
 */
export interface ParamsConfig {
  directiveType: DirectiveTypeConfig;
  layerType: LayerTypeConfig;
}

/**
 * Security enforcement level for a single category.
 *
 * - `'off'` disables the category completely.
 * - `'safe'` rejects the most common high-confidence threats.
 * - `'strict'` rejects a broader pattern set, including encoded variants.
 *
 * @intent Express the trade-off between false positives and coverage explicitly.
 */
export type Level = 'off' | 'safe' | 'strict';

/**
 * The five built-in security categories enforced by SecurityValidator.
 *
 * - `shellInjection` — shell control characters (Phase 1, applies to every argument)
 * - `absolutePath` — POSIX/Windows absolute paths (Phase 2, path-kind only)
 * - `homeExpansion` — `~` based home directory expansion (Phase 2, path-kind only)
 * - `parentTraversal` — `..` traversal sequences (Phase 2, path-kind only)
 * - `specialChars` — control characters / non-printable bytes (Phase 2, path-kind only)
 *
 * @intent Each category has an independent level so callers can tune surface area.
 */
export type SecurityCategory =
  | 'shellInjection'
  | 'absolutePath'
  | 'homeExpansion'
  | 'parentTraversal'
  | 'specialChars';

/**
 * Per-category level map.
 *
 * @expects Missing keys fall back to the surrounding global level.
 */
export type SecurityCategoryLevels = Partial<Record<SecurityCategory, Level>>;

/**
 * Security policy expression.
 *
 * Either a single level applied to every category, or an explicit per-category
 * map. The value is interpreted by `resolveEffectivePolicy`.
 *
 * @reason Most callers only want a single knob. Power users can override
 * individual categories without adopting a full custom resolver.
 */
export type SecurityPolicy = Level | SecurityCategoryLevels;

/**
 * Classification of a value option's content kind.
 *
 * - `'path'` — value is treated as a filesystem path; the four path-related
 *   categories (absolutePath / homeExpansion / parentTraversal / specialChars)
 *   are evaluated.
 * - `'text'` — value is opaque text; only `shellInjection` (Phase 1) applies.
 *
 * @reason Path checks would produce false positives on arbitrary text values
 * (e.g. `--config=../sibling` is a config file name, not a traversal attempt).
 */
export type ValueKind = 'path' | 'text';

/**
 * Top-level security configuration injected via `CustomConfig.security`.
 *
 * @intent Library callers express security intent declaratively rather than
 * by registering custom validator instances.
 */
export interface SecurityConfig {
  policy: SecurityPolicy;
}

/**
 * Option definition for a single CLI option entry.
 *
 * @property kind - For value options only: how the value should be classified
 *   for security validation. Defaults to `'text'` when omitted; built-in
 *   `from` and `destination` default to `'path'`.
 * @property securityPolicy - Per-option override of the global security policy.
 *   Only the four path categories can be relaxed/tightened per-option;
 *   `shellInjection` is global.
 */
export interface OptionDefinition {
  shortForm?: string;
  description: string;
  valueRequired?: boolean;
  kind?: ValueKind;
  securityPolicy?: SecurityPolicy;
}

/**
 * User variable configuration
 */
export interface UserVariableConfig {
  pattern: string;
  description: string;
}

/**
 * Option definitions
 */
export interface OptionsDefinitions {
  flags: Record<string, OptionDefinition>;
  values: Record<string, OptionDefinition>;
  userVariables: UserVariableConfig;
}

/**
 * Validation rules for a parameter mode
 */
export interface ValidationRules {
  allowedOptions: string[];
  allowedValueOptions?: string[];
  allowUserVariables: boolean;
}

/**
 * Error handling configuration
 */
export interface ErrorHandlingConfig {
  unknownOption: 'error' | 'ignore' | 'warn';
  duplicateOption: 'error' | 'ignore' | 'warn';
  emptyValue: 'error' | 'ignore' | 'warn';
}

/**
 * Complete custom configuration
 */
export interface CustomConfig {
  params: {
    two: ParamsConfig;
  };
  options: OptionsDefinitions;
  validation: {
    zero: ValidationRules;
    one: ValidationRules;
    two: ValidationRules;
  };
  errorHandling: ErrorHandlingConfig;
  /**
   * Optional security policy. When omitted the runtime treats it as
   * `{ policy: 'safe' }` for all categories.
   */
  security?: SecurityConfig;
}

/**
 * Default custom configuration
 */
export const DEFAULT_CUSTOM_CONFIG: CustomConfig = {
  params: {
    two: {
      directiveType: {
        pattern: '^(to|summary|defect)$',
        errorMessage: 'Invalid directive type. Must be one of: to, summary, defect',
      },
      layerType: {
        pattern: '^(project|issue|task)$',
        errorMessage: 'Invalid layer type. Must be one of: project, issue, task',
      },
    },
  },
  options: {
    flags: {
      help: {
        shortForm: 'h',
        description: 'Display help information',
      },
      version: {
        shortForm: 'v',
        description: 'Display version information',
      },
    },
    values: {
      from: {
        shortForm: 'f',
        description: 'Source file path',
        valueRequired: true,
        kind: 'path',
      },
      destination: {
        shortForm: 'o',
        description: 'Output file path',
        valueRequired: true,
        kind: 'path',
      },
      input: {
        shortForm: 'i',
        description: 'Input layer type (alias for edition)',
        valueRequired: true,
        kind: 'text',
      },
      adaptation: {
        shortForm: 'a',
        description: 'Prompt adaptation type',
        valueRequired: true,
        kind: 'text',
      },
      config: {
        shortForm: 'c',
        description: 'Configuration file name',
        valueRequired: true,
        kind: 'text',
      },
      edition: {
        shortForm: 'e',
        description: 'Input layer type',
        valueRequired: true,
        kind: 'text',
      },
    },
    userVariables: {
      pattern: '^uv-[a-zA-Z][a-zA-Z0-9_-]*$',
      description: 'User-defined variables (--uv-*)',
    },
  },
  validation: {
    zero: {
      allowedOptions: ['help', 'version'],
      allowedValueOptions: [],
      allowUserVariables: false,
    },
    one: {
      allowedOptions: ['config'],
      allowedValueOptions: ['from', 'destination', 'input', 'adaptation', 'edition'],
      allowUserVariables: false,
    },
    two: {
      allowedOptions: ['from', 'destination', 'config', 'adaptation', 'input', 'edition'],
      allowedValueOptions: ['from', 'destination', 'input', 'adaptation', 'config', 'edition'],
      allowUserVariables: true,
    },
  },
  errorHandling: {
    unknownOption: 'error',
    duplicateOption: 'error',
    emptyValue: 'error',
  },
  security: {
    policy: 'safe',
  },
};
