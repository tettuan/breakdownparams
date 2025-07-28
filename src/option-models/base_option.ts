import { Option, OptionType } from '../types/option_type.ts';
import { ValidationResult } from '../types/validation_result.ts';

/**
 * Base abstract class for all command-line option types.
 *
 * This class provides common functionality for processing command-line options,
 * including both flag options (boolean) and value options (with associated values).
 * It handles various input formats including short form (-x) and long form (--xxx).
 *
 * @abstract
 * @implements {Option}
 *
 * @example
 * ```ts
 * // Subclasses would extend this base:
 * class FlagOption extends BaseOption {
 *   type = "flag" as const;
 *   getValue() { return true; }
 * }
 * ```
 */
export abstract class BaseOption implements Option {
  abstract readonly type: OptionType;
  abstract readonly name: string;
  abstract readonly aliases: string[];
  abstract readonly description: string;
  abstract readonly isRequired: boolean;

  // New properties for enhanced functionality
  protected rawInput: string;
  protected shortname?: string;
  protected longname: string;

  /**
   * Creates a new BaseOption instance.
   *
   * @param rawInput - The raw command-line input (e.g., "--verbose", "-v")
   * @param longname - The long form of the option (e.g., "--verbose")
   * @param shortname - Optional short form of the option (e.g., "-v")
   */
  constructor(rawInput: string, longname: string, shortname?: string) {
    this.rawInput = rawInput;
    this.longname = longname;
    this.shortname = shortname;
  }

  /**
   * Checks if the input is in shorthand form.
   *
   * @returns True if the option starts with a single dash (e.g., "-v")
   *
   * @example
   * ```ts
   * option.isShorthand(); // true for "-v", false for "--verbose"
   * ```
   */
  isShorthand(): boolean {
    return this.rawInput.startsWith('-') && !this.rawInput.startsWith('--');
  }

  /**
   * Checks if the input is in long form.
   *
   * @returns True if the option starts with double dashes (e.g., "--verbose")
   *
   * @example
   * ```ts
   * option.isLongForm(); // true for "--verbose", false for "-v"
   * ```
   */
  isLongForm(): boolean {
    return this.rawInput.startsWith('--');
  }

  /**
   * Checks if this is a user variable option.
   *
   * User variable options are custom options that start with "--uv-" prefix
   * and allow users to define their own command-line variables.
   *
   * @returns True if the option is a user variable (starts with "--uv-")
   *
   * @example
   * ```ts
   * option.isUserVariable(); // true for "--uv-config", false for "--verbose"
   * ```
   */
  isUserVariable(): boolean {
    return this.longname.startsWith('--uv-');
  }

  /**
   * Checks if an input string matches this option.
   *
   * This method compares against the option's long form, short form,
   * and any aliases to determine if the input represents this option.
   *
   * @param input - The input string to check (e.g., "--verbose", "-v")
   * @returns True if the input matches this option in any form
   *
   * @example
   * ```ts
   * const verboseOption = new FlagOption("--verbose", "--verbose", "-v");
   * verboseOption.matchesInput("--verbose"); // true
   * verboseOption.matchesInput("-v"); // true
   * verboseOption.matchesInput("--quiet"); // false
   * ```
   */
  matchesInput(input: string): boolean {
    const normalizedInput = this.normalizeInput(input);
    return normalizedInput === this.longname ||
      normalizedInput === this.shortname ||
      this.aliases.some((alias) => normalizedInput === alias);
  }

  /**
   * Gets the normalized (canonical) name of the option.
   *
   * The normalized name is the option name without any leading dashes.
   * This provides a consistent way to reference options internally.
   *
   * @returns The option name without dashes (e.g., "help", "verbose", "uv-config")
   *
   * @example
   * ```ts
   * option.toNormalized(); // "verbose" for "--verbose"
   * option.toNormalized(); // "uv-config" for "--uv-config"
   * ```
   */
  toNormalized(): string {
    // Remove all leading dashes from the long name
    return this.longname.replace(/^-+/, '');
  }

  /**
   * Gets the long form representation of the option.
   *
   * Ensures the option is formatted with double dashes prefix.
   *
   * @returns The option in long form (e.g., "--verbose")
   *
   * @example
   * ```ts
   * option.toLong(); // "--verbose"
   * ```
   */
  toLong(): string {
    return this.longname.startsWith('--') ? this.longname : `--${this.longname}`;
  }

  /**
   * Gets the short form representation of the option if available.
   *
   * @returns The option in short form (e.g., "-v") or undefined if no short form exists
   *
   * @example
   * ```ts
   * option.toShort(); // "-v" for verbose option
   * option.toShort(); // undefined for options without short form
   * ```
   */
  toShort(): string | undefined {
    if (!this.shortname) return undefined;
    return this.shortname.startsWith('-') ? this.shortname : `-${this.shortname}`;
  }

  /**
   * Extracts and normalizes the option name from various input formats.
   *
   * This method handles inputs with values (e.g., "--config=file.json")
   * and converts short forms to long forms when possible.
   *
   * @param input - The raw input string to normalize
   * @returns The normalized option name in long form
   * @protected
   */
  protected normalizeInput(input: string): string {
    // Remove value part if present
    const [optionPart] = input.split('=');

    if (optionPart.startsWith('--')) {
      return optionPart;
    } else if (optionPart.startsWith('-')) {
      // Convert short form to long form if we know the mapping
      return this.shortname === optionPart ? this.longname : optionPart;
    }

    return optionPart;
  }

  /**
   * Extracts the value portion from an option input string.
   *
   * For options with values using the equals syntax (e.g., "--config=file.json"),
   * this method extracts the value part after the equals sign.
   *
   * @param input - The input string potentially containing a value
   * @returns The extracted value or undefined if no value is present
   * @protected
   *
   * @example
   * ```ts
   * extractValue("--config=file.json"); // "file.json"
   * extractValue("--verbose"); // undefined
   * ```
   */
  protected extractValue(input: string): string | undefined {
    const parts = input.split('=');
    return parts.length > 1 ? parts.slice(1).join('=') : undefined;
  }

  /**
   * Gets the value of the option.
   *
   * For flag options, this returns a boolean (typically true).
   * For value options, this returns the associated string value.
   *
   * @returns The option's value as either string or boolean
   * @abstract
   */
  abstract getValue(): string | boolean;

  /**
   * Validates the option and its value.
   *
   * Subclasses implement specific validation logic based on their option type.
   * For example, flag options might reject values, while value options might
   * require them.
   *
   * @param value - Optional value to validate with the option
   * @returns Validation result indicating success or failure with error details
   * @abstract
   */
  abstract validate(value?: string): ValidationResult;
}
