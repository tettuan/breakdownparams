import { Option } from '../types/option_type.ts';
import { FlagOption } from '../option-models/flag_option.ts';
import { ValueOption } from '../option-models/value_option.ts';
import { UserVariableOption } from '../option-models/user_variable_option.ts';

/**
 * Configuration for a standard command-line option.
 *
 * @property longname - The long form name without dashes (e.g., "help")
 * @property shortname - The short form name without dash (e.g., "h")
 * @property type - The option type: "flag" for boolean, "value" for options with values
 * @property aliasOf - Optional alias target, maps this option to another option's internal name
 */
type OptionConfig = {
  longname: string;
  shortname: string;
  type: 'flag' | 'value';
  aliasOf?: string;
};

/**
 * Predefined standard options configuration.
 *
 * This configuration defines the standard command-line options available
 * in the system, including their long and short forms and whether they
 * accept values or are boolean flags.
 *
 * @example
 * ```ts
 * // Accessing help option config
 * STANDARD_OPTIONS.help; // { longname: "help", shortname: "h", type: "flag" }
 * ```
 */
export const STANDARD_OPTIONS: Record<string, OptionConfig> = {
  help: {
    longname: 'help',
    shortname: 'h',
    type: 'flag',
  },
  version: {
    longname: 'version',
    shortname: 'v',
    type: 'flag',
  },
  from: {
    longname: 'from',
    shortname: 'f',
    type: 'value',
  },
  destination: {
    longname: 'destination',
    shortname: 'o',
    type: 'value',
  },
  input: {
    longname: 'input',
    shortname: 'i',
    type: 'value',
  },
  adaptation: {
    longname: 'adaptation',
    shortname: 'a',
    type: 'value',
  },
  config: {
    longname: 'config',
    shortname: 'c',
    type: 'value',
  },
  edition: {
    longname: 'edition',
    shortname: 'e',
    type: 'value',
    aliasOf: 'input',
  },
} as const;

/**
 * Factory interface for creating command line options.
 *
 * Implementations of this interface are responsible for parsing
 * raw command-line arguments and creating appropriate Option instances.
 */
export interface OptionFactory {
  /**
   * Creates option objects from raw command line arguments.
   *
   * This method processes an array of command-line arguments and
   * creates the appropriate Option instances (FlagOption, ValueOption,
   * or UserVariableOption) based on the argument format and configuration.
   *
   * @param args - Array of command line arguments to process
   * @returns Array of created Option instances
   * @throws Error if an unknown option is encountered or format is invalid
   *
   * @example
   * ```ts
   * factory.createOptionsFromArgs(["--help", "--config=app.json"]);
   * // Returns: [FlagOption, ValueOption]
   * ```
   */
  createOptionsFromArgs(args: string[]): Option[];
}

/**
 * Default factory implementation for creating command line options.
 *
 * This factory creates Option instances from command-line arguments by:
 * - Recognizing standard options from STANDARD_OPTIONS configuration
 * - Supporting user variable options with --uv- prefix
 * - Validating option formats and value requirements
 * - Creating appropriate Option subclass instances
 *
 * @implements {OptionFactory}
 *
 * @example
 * ```ts
 * const factory = new CommandLineOptionFactory();
 * const options = factory.createOptionsFromArgs(["--help", "--from=input.txt"]);
 * ```
 */
export class CommandLineOptionFactory implements OptionFactory {
  /**
   * Creates option objects from command line arguments.
   *
   * Processes each argument and creates the appropriate Option instance.
   * Supports standard options, user variables, and both flag and value types.
   *
   * @param args - Array of command line arguments to process
   * @returns Array of created Option instances
   * @throws Error if any argument is invalid or unknown
   */
  createOptionsFromArgs(args: string[]): Option[] {
    return args.map((arg) => this.createOptionFromString(arg));
  }

  /**
   * Creates a single option from a command line argument string.
   *
   * This method determines the option type and creates the appropriate
   * Option subclass instance. It handles:
   * - User variable options (--uv-*)
   * - Standard flag options (no value)
   * - Standard value options (with = syntax)
   *
   * @param optionInput - Single command line argument string
   * @returns Created Option instance
   * @throws Error if option is unknown or has invalid format
   * @private
   *
   * @example
   * ```ts
   * createOptionFromString("--help"); // Creates FlagOption
   * createOptionFromString("--config=app.json"); // Creates ValueOption
   * createOptionFromString("--uv-apiKey=abc123"); // Creates UserVariableOption
   * ```
   */
  private createOptionFromString(optionInput: string): Option {
    const [name, value] = optionInput.split('=');
    const normalizedName = this.normalizeOptionName(name);

    // Handle user variable options (e.g., --uv-config=value)
    if (name.startsWith('--uv-')) {
      return new UserVariableOption(name, 'User variable option', optionInput);
    }

    // Find the standard option configuration
    const optionConfig = this.findStandardOptionConfig(normalizedName);
    if (!optionConfig) {
      throw new Error(`Unknown option: ${name}`);
    }

    // Create option based on its type
    switch (optionConfig.type) {
      case 'flag':
        // Flag options should not have values
        if (value !== undefined) {
          throw new Error(`Flag option ${name} should not have a value`);
        }
        return new FlagOption(
          `--${optionConfig.longname}`,
          [`-${optionConfig.shortname}`],
          'Flag option',
          optionInput, // Pass raw input
          `--${optionConfig.longname}`,
          `-${optionConfig.shortname}`,
        );
      case 'value': {
        // Value options require a value (= must be present)
        if (!optionInput.includes('=')) {
          throw new Error(`Option ${name} requires a value`);
        }
        // Use aliasOf for internal name if this is an alias
        const internalName = optionConfig.aliasOf || optionConfig.longname;
        return new ValueOption(
          `--${internalName}`,
          [`-${optionConfig.shortname}`],
          false,
          'Value option',
          (val: string) => ({ isValid: true, validatedParams: [val] }),
          optionInput, // Pass raw input
          `--${internalName}`,
          `-${optionConfig.shortname}`,
        );
      }
      default:
        throw new Error(`Unsupported option type: ${optionConfig.type}`);
    }
  }

  /**
   * Normalizes an option name by removing leading dashes.
   *
   * Converts both long form (--option) and short form (-o) to
   * their base names without dashes for consistent lookup.
   *
   * @param name - Option name with dashes
   * @returns Normalized name without dashes
   * @private
   *
   * @example
   * ```ts
   * normalizeOptionName("--help"); // "help"
   * normalizeOptionName("-h"); // "h"
   * normalizeOptionName("help"); // "help"
   * ```
   */
  private normalizeOptionName(name: string): string {
    return name.replace(/^--?/, '');
  }

  /**
   * Finds the standard option configuration for a given option name.
   *
   * Searches through STANDARD_OPTIONS to find a configuration that
   * matches either the long name or short name of the provided option.
   *
   * @param name - Normalized option name (without dashes)
   * @returns Option configuration if found, undefined otherwise
   * @private
   *
   * @example
   * ```ts
   * findStandardOptionConfig("help"); // Returns help configuration
   * findStandardOptionConfig("h"); // Returns help configuration
   * findStandardOptionConfig("unknown"); // Returns undefined
   * ```
   */
  private findStandardOptionConfig(
    name: string,
  ): (typeof STANDARD_OPTIONS)[keyof typeof STANDARD_OPTIONS] | undefined {
    return Object.values(STANDARD_OPTIONS).find(
      (config) => config.longname === name || config.shortname === name,
    );
  }
}
