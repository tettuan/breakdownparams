import { Option } from '../types/option_type.ts';
import { FlagOption } from '../option-models/flag_option.ts';
import { ValueOption } from '../option-models/value_option.ts';
import { CustomVariableOption } from '../option-models/custom_variable_option.ts';

type OptionConfig = {
  longname: string;
  shortname: string;
  type: 'flag' | 'value';
};

/**
 * Standard options configuration
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
} as const;

/**
 * Factory interface for creating command line options
 */
export interface OptionFactory {
  /**
   * Creates options from command line arguments
   * @param args Command line arguments
   * @returns Array of created options
   */
  createOptionsFromArgs(args: string[]): Option[];
}

/**
 * Factory implementation for creating command line options
 */
export class CommandLineOptionFactory implements OptionFactory {
  /**
   * Creates options from command line arguments
   * @param args Command line arguments
   * @returns Array of created options
   */
  createOptionsFromArgs(args: string[]): Option[] {
    return args.map((arg) => this.createOptionFromString(arg));
  }

  /**
   * Creates an option from a command line argument string
   * @param arg Command line argument string
   * @returns Created option
   */
  private createOptionFromString(arg: string): Option {
    const [name, value] = arg.split('=');
    const normalizedName = this.normalizeOptionName(name);

    // Handle custom variable options (e.g., --uv-config=value)
    if (name.startsWith('--uv-')) {
      return new CustomVariableOption(name, 'Custom variable option');
    }

    // Find the standard option configuration
    const optionConfig = this.findStandardOptionConfig(normalizedName);
    if (!optionConfig) {
      throw new Error(`Unknown option: ${name}`);
    }

    // Create option based on its type
    switch (optionConfig.type) {
      case 'flag':
        return new FlagOption(
          `--${optionConfig.longname}`,
          [optionConfig.shortname],
          'Flag option',
        );
      case 'value':
        if (!value) {
          throw new Error(`Option ${name} requires a value`);
        }
        return new ValueOption(
          `--${optionConfig.longname}`,
          [optionConfig.shortname],
          false,
          'Value option',
          (val: string) => ({ isValid: true, validatedParams: [val] }),
        );
      default:
        throw new Error(`Unsupported option type: ${optionConfig.type}`);
    }
  }

  /**
   * Normalizes an option name by removing leading dashes
   * @param name Option name
   * @returns Normalized option name
   */
  private normalizeOptionName(name: string): string {
    return name.replace(/^--?/, '');
  }

  /**
   * Finds the standard option configuration for a given option name
   * @param name Option name
   * @returns Standard option configuration or undefined if not found
   */
  private findStandardOptionConfig(
    name: string,
  ): (typeof STANDARD_OPTIONS)[keyof typeof STANDARD_OPTIONS] | undefined {
    return Object.values(STANDARD_OPTIONS).find(
      (config) => config.longname === name || config.shortname === name,
    );
  }
}
