import { ValidationResult } from './validation_result.ts';

/**
 * Defines the types of command-line options that the system can handle.
 *
 * This enum categorizes options based on their behavior and value requirements,
 * enabling the parser to correctly interpret and validate different option patterns
 * in command-line arguments.
 *
 * @enum {string}
 */
export enum OptionType {
  /**
   * Options that require an associated value.
   *
   * These options expect a value to follow them in the command line.
   * Examples: --output file.txt, -o file.txt
   *
   * The parser will look for the next argument as the value for this option.
   */
  VALUE = 'value',
  /**
   * Boolean flag options that don't require a value.
   *
   * These options represent on/off switches and their presence alone
   * indicates true/enabled state.
   * Examples: --verbose, -v, --debug
   *
   * The parser treats these as boolean true when present, false when absent.
   */
  FLAG = 'flag',
  /**
   * User-defined variable options.
   *
   * These options allow users to define arbitrary key-value pairs
   * for extended configuration or customization purposes.
   * Examples: --var:theme=dark, --var:timeout=30
   *
   * The parser extracts both the variable name and value from the option string.
   */
  USER_VARIABLE = 'user_variable',
}

/**
 * Core interface defining the structure and behavior of command-line options.
 *
 * This interface serves as the contract for all option implementations,
 * ensuring consistent behavior across different option types while providing
 * flexibility for custom validation and parsing logic.
 *
 * The design follows the Strategy pattern, allowing each option to define
 * its own validation and parsing behavior while maintaining a unified interface.
 */
export interface Option {
  /**
   * The type category of this option.
   *
   * Determines how the parser will handle this option's value requirements
   * and parsing behavior.
   */
  type: OptionType;
  /**
   * The canonical name of the option.
   *
   * This is the primary identifier used internally and in documentation.
   * Should be descriptive and follow consistent naming conventions.
   * Example: 'output', 'verbose', 'config-file'
   */
  name: string;
  /**
   * Alternative names for this option.
   *
   * Provides flexibility in command-line usage by allowing multiple
   * ways to specify the same option. Typically includes both long
   * and short forms.
   * Example: ['o'] for 'output', ['v', 'verb'] for 'verbose'
   */
  aliases: string[];
  /**
   * Human-readable description of the option's purpose.
   *
   * Used in help text and documentation generation. Should clearly
   * explain what the option does and when to use it.
   */
  description: string;
  /**
   * Indicates whether this option must be provided.
   *
   * When true, the parser will return a validation error if this
   * option is not present in the command-line arguments.
   */
  isRequired: boolean;
  /**
   * Validates the option's value according to its specific rules.
   *
   * This method implements option-specific validation logic, checking
   * constraints like format, range, or business rules.
   *
   * @param value - The raw value to validate (may be undefined for flag options)
   * @returns ValidationResult containing success status and any error details
   */
  validate(value?: unknown): ValidationResult;
  /**
   * Optional custom parser for transforming the raw string value.
   *
   * Allows options to convert string inputs into appropriate data types
   * or structures (e.g., parsing JSON, converting to numbers, expanding paths).
   *
   * @param value - The raw string value from command line
   * @returns The parsed/transformed value
   */
  parse?(value: unknown): unknown;

  // Methods for enhanced option analysis and manipulation
  /**
   * Determines if the option is specified in shorthand form.
   *
   * Shorthand forms typically use a single dash followed by a single character.
   * This method helps in parsing logic to handle different option formats.
   *
   * @returns true if the option is in shorthand form (e.g., -o), false otherwise
   */
  isShorthand(): boolean;
  /**
   * Determines if the option is specified in long form.
   *
   * Long forms typically use double dashes followed by a descriptive name.
   * This distinction is important for proper parsing and validation.
   *
   * @returns true if the option is in long form (e.g., --output), false otherwise
   */
  isLongForm(): boolean;
  /**
   * Checks if this option represents a user variable.
   *
   * User variables have special parsing rules and are typically used
   * for extending configuration beyond predefined options.
   *
   * @returns true if this is a USER_VARIABLE type option, false otherwise
   */
  isUserVariable(): boolean;
  /**
   * Tests whether a given input string matches this option.
   *
   * Checks against the option's name and all aliases, supporting both
   * long and short forms. This is the primary method used during parsing
   * to identify which option an argument represents.
   *
   * @param input - The command-line argument to test
   * @returns true if the input matches this option, false otherwise
   */
  matchesInput(input: string): boolean;
  /**
   * Returns the normalized (canonical) form of the option name.
   *
   * Provides a consistent internal representation regardless of how
   * the option was specified on the command line.
   *
   * @returns The canonical option name
   */
  toNormalized(): string;
  /**
   * Generates the long form representation of this option.
   *
   * Used for generating help text and converting between option formats.
   *
   * @returns The long form string (e.g., "--output")
   */
  toLong(): string;
  /**
   * Generates the short form representation if available.
   *
   * Not all options have short forms. This method returns undefined
   * if no short alias is defined.
   *
   * @returns The short form string (e.g., "-o") or undefined if not available
   */
  toShort(): string | undefined;
  /**
   * Retrieves the current value of this option.
   *
   * The return type depends on the option type:
   * - VALUE options return their string value
   * - FLAG options return boolean (true if set)
   * - USER_VARIABLE options return their string value
   *
   * @returns The option's value as string or boolean
   */
  getValue(): string | boolean;
}

/**
 * Represents the possible value types for command-line options.
 *
 * This union type covers all possible option values:
 * - string: For VALUE and USER_VARIABLE option types
 * - boolean: For FLAG option types (true when present)
 * - undefined: For options that haven't been set or have no value
 */
export type OptionValue = string | boolean | undefined;

/**
 * Type for parsed options
 */
export interface OptionParams {
  /** Source file path */
  fromFile?: string;

  /** Output file path */
  destinationFile?: string;

  /** Input layer type */
  fromLayerType?: string;

  /** Prompt adaptation type */
  adaptationType?: string;

  /** Configuration file name */
  configFile?: string;

  /** User variables */
  userVariables?: Record<string, string>;
}
