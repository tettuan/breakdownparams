import type { OptionRule } from '../../types/option_rule.ts';
import type { ValidationResult } from '../../types/validation_result.ts';

/**
 * Predefined error messages for option validation.
 *
 * Provides consistent error messaging across all option validators
 * with parameterized message generation for specific contexts.
 */
const ERROR_MESSAGES = {
  INVALID_TYPE: (type: string) => `Invalid parameter type for this validator: ${type}`,
  INVALID_OPTIONS: (type: string, options: string[]) =>
    `Invalid options for ${type} parameters: ${options.join(', ')}`,
  EMPTY_VALUE: (option: string) => `Empty value not allowed for option: ${option}`,
} as const;

/**
 * Base interface for option validators.
 *
 * Defines the contract for validating command-line options based on
 * the number of parameters (zero, one, or two) and specified rules.
 */
export interface OptionValidator {
  /**
   * Validates command-line options based on parameter type and rules.
   *
   * @param args - Raw command line arguments including options
   * @param type - The parameter type context for validation
   * @param optionRule - Rules defining allowed options for each parameter type
   * @returns Validation result indicating success or failure with details
   *
   * @example
   * ```ts
   * const validator = new ZeroOptionValidator();
   * validator.validate(["--help"], "zero", optionRule);
   * // { isValid: true, validatedParams: [] }
   * ```
   */
  validate(args: string[], type: 'zero' | 'one' | 'two', optionRule: OptionRule): ValidationResult;
}

/**
 * Base abstract class for option validators.
 *
 * Provides common functionality for validating command-line options
 * including option normalization, validation against allowed lists,
 * and user variable support.
 *
 * @abstract
 * @implements {OptionValidator}
 */
abstract class BaseOptionValidator implements OptionValidator {
  protected abstract readonly paramType: 'zero' | 'one' | 'two';
  protected abstract readonly validOptions: string[];
  protected abstract readonly allowUserVariables: boolean;

  /**
   * Normalizes an option string into key and value components.
   *
   * Splits options in the format --key=value into separate parts.
   *
   * @param option - The option string to normalize (e.g., "--config=file.json")
   * @returns Object with key and optional value
   * @protected
   *
   * @example
   * ```ts
   * normalizeOption("--config=file.json"); // { key: "config", value: "file.json" }
   * normalizeOption("--verbose"); // { key: "verbose", value: undefined }
   * ```
   */
  protected static normalizeOption(option: string): { key: string; value: string | undefined } {
    const [key, value] = option.slice(2).split('=');
    return { key, value };
  }

  /**
   * Validates options against a list of allowed options.
   *
   * @param options - Array of option strings to validate
   * @param validOptions - Array of allowed option names
   * @protected
   */
  protected static validateOptions(
    options: string[],
    validOptions: string[],
    flagOptions: Record<string, boolean>,
    allowUserVariables: boolean,
  ): { isValid: boolean; invalidOptions: string[] } {
    const invalidOptions = options.filter((opt) => {
      const { key } = this.normalizeOption(opt);
      return !validOptions.includes(key) && !Object.keys(flagOptions).includes(key) &&
        (!allowUserVariables || !key.startsWith('uv-'));
    });
    return {
      isValid: invalidOptions.length === 0,
      invalidOptions,
    };
  }

  /**
   * Create an error validation result
   */
  protected createError(message: string, code: string): ValidationResult {
    return {
      isValid: false,
      validatedParams: [],
      errorMessage: message,
      errorCode: code,
      errorCategory: 'validation',
    };
  }

  /**
   * Create a success validation result
   */
  protected createSuccess(options: string[], optionRule: OptionRule): ValidationResult {
    return {
      isValid: true,
      validatedParams: [],
      options: options.reduce((acc, opt) => {
        const { key, value } = BaseOptionValidator.normalizeOption(opt);
        if (Object.keys(optionRule.flagOptions).includes(key)) {
          acc[key] = true;
        } else if (value === undefined) {
          acc[key] = true;
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, unknown>),
    };
  }

  /**
   * Validate the options
   */
  validate(args: string[], type: string, optionRule: OptionRule): ValidationResult {
    // Type check
    if (type !== this.paramType) {
      return this.createError(
        ERROR_MESSAGES.INVALID_TYPE(type),
        'INVALID_PARAMETER_TYPE',
      );
    }

    const options = args.filter((arg) => arg.startsWith('--'));

    // If there are no options, consider it successful
    if (options.length === 0) {
      return this.createSuccess([], optionRule);
    }

    // Check for empty values
    const emptyValueOptions = options.filter((opt) => {
      const { key, value } = BaseOptionValidator.normalizeOption(opt);
      return !Object.keys(optionRule.flagOptions).includes(key) && value === '';
    });

    if (emptyValueOptions.length > 0) {
      return this.createError(
        ERROR_MESSAGES.EMPTY_VALUE(emptyValueOptions[0]),
        'INVALID_OPTIONS',
      );
    }

    const { isValid, invalidOptions } = BaseOptionValidator.validateOptions(
      options,
      [...this.validOptions, ...Object.keys(optionRule.flagOptions)],
      optionRule.flagOptions,
      this.allowUserVariables,
    );

    if (!isValid) {
      return this.createError(
        ERROR_MESSAGES.INVALID_OPTIONS(this.paramType, invalidOptions),
        'INVALID_OPTIONS',
      );
    }

    return this.createSuccess(options, optionRule);
  }
}

/**
 * Validator for zero parameter options (help/version)
 */
export class ZeroOptionValidator extends BaseOptionValidator {
  protected readonly paramType = 'zero' as const;
  protected readonly validOptions = [];
  protected readonly allowUserVariables = false;
}

/**
 * Validator for one parameter options (init)
 */
export class OneOptionValidator extends BaseOptionValidator {
  protected readonly paramType = 'one' as const;
  protected readonly validOptions = [];
  protected readonly allowUserVariables = false;
}

/**
 * Validator for two parameter options (main functionality)
 */
export class TwoOptionValidator extends BaseOptionValidator {
  protected readonly paramType = 'two' as const;
  protected readonly validOptions = [
    'from',
    'destination',
    'input',
    'adaptation',
    'config',
    'edition',
  ];
  protected readonly allowUserVariables = true;
}
