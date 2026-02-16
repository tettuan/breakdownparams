import { OptionType } from '../types/option_type.ts';
import type { ValidationResult } from '../types/validation_result.ts';
import { validateOptionName } from './format_utils.ts';
import { BaseOption } from './base_option.ts';

/**
 * Represents a flag option (boolean option) for command-line arguments.
 *
 * Flag options are boolean options that are either present (true) or absent (false).
 * They do not accept values and are typically used for enabling/disabling features
 * or modes of operation.
 *
 * @extends BaseOption
 *
 * @example
 * ```ts
 * // Create a verbose flag option
 * const verboseFlag = new FlagOption(
 *   "verbose",
 *   ["v"],
 *   "Enable verbose output",
 *   "--verbose"
 * );
 *
 * // Usage: mycommand --verbose
 * // or:    mycommand -v
 * ```
 */
export class FlagOption extends BaseOption {
  readonly type = OptionType.FLAG;
  readonly isRequired = false;

  /**
   * Creates a new FlagOption instance.
   *
   * @param name - The primary name of the option (without dashes)
   * @param aliases - Array of alternative names for this option
   * @param description - Human-readable description of what this option does
   * @param longname - The long form of the option (e.g., "--verbose")
   * @param shortname - The short form of the option (e.g., "-v")
   * @param rawInput - The raw command-line input that created this option
   * @throws Error if the option name or any alias is invalid
   */
  constructor(
    readonly name: string,
    readonly aliases: string[],
    readonly description: string,
    longname?: string,
    shortname?: string,
    rawInput: string = '',
  ) {
    // Initialize base option with long and short names
    super(rawInput || name, longname || name, shortname);

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
   * Gets the value for flag options.
   *
   * Flag options always return true when present, as they represent
   * a boolean state that is enabled by their presence on the command line.
   *
   * @returns Always returns true for flag options
   *
   * @example
   * ```ts
   * const flag = new FlagOption("verbose", [], "Enable verbose mode");
   * flag.getValue(); // true
   * ```
   */
  getValue(): boolean {
    return true;
  }

  /**
   * Validates the flag option.
   *
   * Flag options are always valid when present, as they don't accept values.
   * The validation was already performed during construction.
   *
   * @returns Always returns a valid result for flag options
   */
  validate(): ValidationResult {
    return {
      isValid: true,
      validatedParams: [],
    };
  }
}
