import { Option, OptionType } from '../types/option_type.ts';
import { ValidationResult } from '../types/validation_result.ts';

/**
 * Base abstract class for all option types
 * Provides common functionality for option processing
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

  constructor(rawInput: string, longname: string, shortname?: string) {
    this.rawInput = rawInput;
    this.longname = longname;
    this.shortname = shortname;
  }

  /**
   * Check if the input is in shorthand form (-x)
   */
  isShorthand(): boolean {
    return this.rawInput.startsWith('-') && !this.rawInput.startsWith('--');
  }

  /**
   * Check if the input is in long form (--xxx)
   */
  isLongForm(): boolean {
    return this.rawInput.startsWith('--');
  }

  /**
   * Check if this is a user variable option
   */
  isCustomVariable(): boolean {
    return this.longname.startsWith('--uv-');
  }

  /**
   * Check if an input string matches this option
   */
  matchesInput(input: string): boolean {
    const normalizedInput = this.normalizeInput(input);
    return normalizedInput === this.longname ||
      normalizedInput === this.shortname ||
      this.aliases.some((alias) => normalizedInput === alias);
  }

  /**
   * Get the normalized (canonical) name
   * All options: without leading dashes (e.g., "help", "from", "uv-config")
   * Aliases are resolved to their primary names
   */
  toNormalized(): string {
    // Remove all leading dashes from the long name
    return this.longname.replace(/^-+/, '');
  }

  /**
   * Get the long form representation
   */
  toLong(): string {
    return this.longname.startsWith('--') ? this.longname : `--${this.longname}`;
  }

  /**
   * Get the short form representation (if available)
   */
  toShort(): string | undefined {
    if (!this.shortname) return undefined;
    return this.shortname.startsWith('-') ? this.shortname : `-${this.shortname}`;
  }

  /**
   * Extract the option name from various input formats
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
   * Extract value from input string
   */
  protected extractValue(input: string): string | undefined {
    const parts = input.split('=');
    return parts.length > 1 ? parts.slice(1).join('=') : undefined;
  }

  /**
   * Get the value (to be implemented by subclasses)
   */
  abstract getValue(): string | boolean;

  /**
   * Validate the option (base implementation)
   */
  abstract validate(value?: string): ValidationResult;
}
