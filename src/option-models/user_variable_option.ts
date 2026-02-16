import { OptionType } from '../types/option_type.ts';
import type { ValidationResult } from '../types/validation_result.ts';
import { UserVariableOptionValidator } from '../validator/options/user_variable_option_validator.ts';
import { BaseOption } from './base_option.ts';

/**
 * Represents a user-defined variable option with the --uv- prefix.
 *
 * User variable options allow users to define user variables on the command line
 * that can be used for configuration or data passing. They follow strict naming rules
 * to ensure consistency and prevent conflicts with standard options.
 *
 * Naming rules:
 * - Variable names must contain only alphanumeric characters and underscores
 * - Must start with a letter (not a number or underscore)
 * - Case sensitive (myVar !== myvar)
 * - Cannot be empty
 * - Always prefixed with --uv- (e.g., --uv-myVariable=value)
 *
 * @extends BaseOption
 *
 * @example
 * ```ts
 * // Create a user variable option
 * const userVar = new UserVariableOption(
 *   "--uv-apiKey",
 *   "API key for external service"
 * );
 *
 * // Usage: mycommand --uv-apiKey=abc123
 * // Valid: --uv-userName=john, --uv-max_retries=3
 * // Invalid: --uv-123start, --uv-my-var, --uv-_underscore
 * ```
 */
export class UserVariableOption extends BaseOption {
  readonly type = OptionType.USER_VARIABLE;
  readonly isRequired = false;
  readonly aliases: string[] = [];
  private readonly validator: UserVariableOptionValidator;
  private value?: string;

  /**
   * Creates a new UserVariableOption instance.
   *
   * @param name - The full option name including --uv- prefix (e.g., "--uv-apiKey")
   * @param description - Human-readable description of what this variable does
   * @param rawInput - The raw command-line input that created this option
   */
  constructor(
    readonly name: string,
    readonly description: string,
    rawInput: string = '',
  ) {
    // Initialize base option - user variables always use their full name with prefix
    super(rawInput || name, name, undefined);
    this.validator = new UserVariableOptionValidator();

    // Extract value from raw input if provided
    if (rawInput) {
      this.value = this.extractValue(rawInput);
    }
  }

  /**
   * Gets the value associated with this user variable.
   *
   * @returns The variable's value, or an empty string if no value is set
   *
   * @example
   * ```ts
   * const userVar = new UserVariableOption("--uv-apiKey", "API key");
   * // After parsing "--uv-apiKey=abc123"
   * userVar.getValue(); // "abc123"
   * ```
   */
  getValue(): string {
    return this.value || '';
  }

  /**
   * Validates the user variable option format and name.
   *
   * Performs comprehensive validation including:
   * - Checking for required --uv- prefix
   * - Ensuring proper format (--uv-name=value)
   * - Validating variable name against naming rules
   *
   * @param value - The value to validate (expected format: "--uv-name=value")
   * @returns Validation result with success status and any error messages
   *
   * @example
   * ```ts
   * userVar.validate("--uv-apiKey=abc123"); // { isValid: true }
   * userVar.validate("--uv-123invalid"); // { isValid: false, errorMessage: "..." }
   * userVar.validate("--config=value"); // { isValid: false, errorMessage: "Option must start with --uv-" }
   * ```
   */
  validate(value: unknown): ValidationResult {
    // Handle undefined value
    if (value === undefined) {
      return {
        isValid: true,
        validatedParams: [],
      };
    }

    const strValue = value as string;

    // 1. Format Check: Basic structure validation
    if (!strValue.startsWith('--uv-')) {
      return {
        isValid: false,
        validatedParams: [],
        errorMessage: 'Option must start with --uv-',
      };
    }

    if (!strValue.includes('=')) {
      return {
        isValid: false,
        validatedParams: [],
        errorMessage: 'Invalid value format: Expected --uv-name=value',
      };
    }

    // 2. Extract variable name and value
    const [variableName] = strValue.split('=');
    const cleanVariableName = variableName.replace('--uv-', '');

    // 3. Delegate to validator for variable name validation
    return this.validator.validateVariableName(cleanVariableName);
  }

  /**
   * Parses the value from a user variable option string.
   *
   * Extracts the value portion after the equals sign in --uv-name=value format.
   *
   * @param value - The raw option string to parse
   * @returns The extracted value or undefined if no value is provided
   *
   * @example
   * ```ts
   * userVar.parse("--uv-apiKey=abc123"); // "abc123"
   * userVar.parse("--uv-config=server.json"); // "server.json"
   * userVar.parse("--uv-empty="); // ""
   * userVar.parse(undefined); // undefined
   * ```
   */
  parse(value: unknown): string | undefined {
    if (value === undefined) {
      return undefined;
    }
    const strValue = value as string;
    if (strValue.includes('=')) {
      // Get everything after the first =
      return strValue.substring(strValue.indexOf('=') + 1);
    }
    return strValue;
  }
}
