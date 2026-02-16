import { OptionType } from '../types/option_type.ts';
import type { ValidationResult } from '../types/validation_result.ts';
import { validateOptionName } from './format_utils.ts';
import { BaseOption } from './base_option.ts';

/**
 * Represents a value option that accepts an associated value.
 *
 * Value options are command-line options that require or accept a value,
 * such as configuration file paths, output directories, or numeric parameters.
 * They support various formats including --option=value and --option value.
 *
 * @extends BaseOption
 *
 * @example
 * ```ts
 * // Create a config file option
 * const configOption = new ValueOption(
 *   "config",
 *   ["c"],
 *   true, // required
 *   "Path to configuration file",
 *   (value) => ({ isValid: value.endsWith('.json'), validatedParams: [] })
 * );
 *
 * // Usage: mycommand --config=app.json
 * // or:    mycommand -c app.json
 * ```
 */
export class ValueOption extends BaseOption {
  readonly type = OptionType.VALUE;
  private value?: string;

  /**
   * Creates a new ValueOption instance.
   *
   * @param name - The primary name of the option (without dashes)
   * @param aliases - Array of alternative names for this option
   * @param isRequired - Whether this option must be provided
   * @param description - Human-readable description of what this option does
   * @param validator - Function to validate the option's value
   * @param longname - The long form of the option (e.g., "--config")
   * @param shortname - The short form of the option (e.g., "-c")
   * @param rawInput - The raw command-line input that created this option
   * @throws Error if the option name or any alias is invalid
   */
  constructor(
    readonly name: string,
    readonly aliases: string[],
    readonly isRequired: boolean,
    readonly description: string,
    readonly validator: (value: string) => ValidationResult,
    longname?: string,
    shortname?: string,
    rawInput: string = '',
  ) {
    // Initialize base option with long and short names
    super(rawInput || name, longname || name, shortname);

    // Extract value from raw input if provided
    if (rawInput) {
      this.value = this.extractValue(rawInput);
    }

    // Validate option name (remove -- prefix if present)
    const cleanName = name.startsWith('--') ? name.slice(2) : name;
    const nameValidation = validateOptionName(cleanName);
    if (!nameValidation.isValid) {
      throw new Error(`Invalid option name: ${nameValidation.error}`);
    }

    // Validate aliases
    for (const alias of aliases) {
      const cleanAlias = alias.startsWith('-') ? alias.slice(1) : alias;
      const aliasValidation = validateOptionName(cleanAlias);
      if (!aliasValidation.isValid) {
        throw new Error(`Invalid alias: ${aliasValidation.error}`);
      }
    }
  }

  /**
   * Gets the value associated with this option.
   *
   * @returns The option's value, or an empty string if no value is set
   *
   * @example
   * ```ts
   * const option = new ValueOption("config", [], true, "Config file", validator);
   * // After parsing "--config=app.json"
   * option.getValue(); // "app.json"
   * ```
   */
  getValue(): string {
    return this.value || '';
  }

  /**
   * Validates the option's value.
   *
   * This method checks if the value is required and non-empty,
   * then runs the custom validator provided during construction.
   *
   * @param value - The value to validate (can be undefined for optional options)
   * @returns Validation result indicating success or failure with error details
   *
   * @example
   * ```ts
   * option.validate("app.json"); // { isValid: true, validatedParams: [] }
   * option.validate(""); // { isValid: false, errorMessage: "Value cannot be empty" }
   * ```
   */
  validate(value: unknown): ValidationResult {
    // For value validation, we don't need to validate option format of name
    // The option name format is validated in constructor

    // Handle undefined value for optional options
    if (value === undefined) {
      if (this.isRequired) {
        return {
          isValid: false,
          validatedParams: [],
          errorMessage: 'Required value is missing',
        };
      }
      return {
        isValid: true,
        validatedParams: [],
      };
    }

    // Extract value from option format
    const strValue = value as string;
    const actualValue = strValue.includes('=') ? strValue.split('=')[1] : strValue;

    // Handle empty value
    if (actualValue === '') {
      if (this.isRequired) {
        return {
          isValid: false,
          validatedParams: [],
          errorMessage: 'Value cannot be empty',
        };
      }
      return {
        isValid: true,
        validatedParams: [],
      };
    }

    // Validate value using custom validator
    return this.validator(actualValue);
  }

  /**
   * Parses the value from various input formats.
   *
   * Handles both equals syntax (--option=value) and space-separated syntax.
   *
   * @param value - The raw value to parse
   * @returns The parsed value or undefined if no value is provided
   *
   * @example
   * ```ts
   * option.parse("--config=app.json"); // "app.json"
   * option.parse("app.json"); // "app.json"
   * option.parse(undefined); // undefined
   * ```
   */
  parse(value: unknown): string | undefined {
    if (value === undefined) {
      return undefined;
    }
    const strValue = value as string;
    if (strValue.includes('=')) {
      return strValue.split('=')[1];
    }
    return strValue;
  }
}
