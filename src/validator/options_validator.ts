import { BaseValidator } from "./base_validator.ts";
import { ValidationResult, OptionRule } from "../result/types.ts";

/**
 * Options Validator
 * Validates command-line options according to the specified rules.
 */
export class OptionsValidator extends BaseValidator {
  protected override optionRule: OptionRule;

  constructor(optionRule: OptionRule) {
    super(optionRule);
    this.optionRule = optionRule;
  }

  /**
   * Validates command-line arguments
   * @param args Command-line arguments
   * @returns Validation result
   */
  public override validate(args: string[]): ValidationResult {
    console.debug('[DEBUG] validate: start', args);
    const options = this.extractOptions(args);
    console.debug('[DEBUG] extractOptions:', options);
    const errors: string[] = [];

    // Check option format
    for (const arg of args) {
      if (arg.startsWith("-")) {
        // Skip format check for special cases
        if (this.isSpecialCase(arg)) {
          continue;
        }
        if (!this.validateOptionFormat(arg)) {
          console.debug('[DEBUG] invalid option format:', arg);
          errors.push(`Invalid option format: ${arg}`);
        }
      }
    }
    console.debug('[DEBUG] after format check, errors:', errors);

    // Check for empty values if not allowed
    if (this.optionRule.validation.emptyValue === "error") {
      for (const [key, value] of Object.entries(options)) {
        // Skip empty value check for special cases
        if (this.isSpecialCase(key)) {
          continue;
        }
        if (value === "") {
          console.debug('[DEBUG] empty value not allowed:', key);
          errors.push(`Empty value not allowed for option: ${key}`);
        }
      }
    }
    console.debug('[DEBUG] after empty value check, errors:', errors);

    // Check for unknown options
    if (this.optionRule.validation.unknownOption === "error") {
      for (const key of Object.keys(options)) {
        if (!this.isValidOption(key)) {
          console.debug('[DEBUG] unknown option:', key);
          errors.push(`Unknown option: ${key}`);
        }
      }
    }
    console.debug('[DEBUG] after unknown option check, errors:', errors);

    // Check for duplicate options
    if (this.optionRule.validation.duplicateOption === "error") {
      const seen = new Set<string>();
      for (const key of Object.keys(options)) {
        if (seen.has(key)) {
          console.debug('[DEBUG] duplicate option:', key);
          errors.push(`Duplicate option: ${key}`);
        }
        seen.add(key);
      }
    }
    console.debug('[DEBUG] after duplicate option check, errors:', errors);

    // Check required options
    for (const required of this.optionRule.validation.requiredOptions) {
      if (!(required in options)) {
        console.debug('[DEBUG] required option missing:', required);
        errors.push(`Required option missing: ${required}`);
      }
    }
    console.debug('[DEBUG] after required option check, errors:', errors);

    if (errors.length > 0) {
      console.debug('[DEBUG] returning error result:', errors);
      return this.createErrorResult(
        errors.join(", "),
        "VALIDATION_ERROR",
        "options"
      );
    }

    console.debug('[DEBUG] returning success result:', args);
    return this.createSuccessResult(args);
  }

  /**
   * Extracts options from command-line arguments
   * @param args Command-line arguments
   * @returns Record of option keys and values
   */
  private extractOptions(args: string[]): Record<string, string> {
    const options: Record<string, string> = {};
    const optionPattern = new RegExp(this.optionRule.format.replace("key", "(.+?)").replace("value", "(.+?)"));

    for (const arg of args) {
      const match = arg.match(optionPattern);
      if (match) {
        const [, key, value] = match;
        options[key] = value;
      } else if (this.isSpecialCase(arg)) {
        // Handle special cases without values
        options[arg] = "";
      }
    }

    return options;
  }

  /**
   * Checks if an option is valid according to the rules
   * @param key Option key
   * @returns Whether the option is valid
   */
  private isValidOption(key: string): boolean {
    // Check special cases
    if (key in this.optionRule.specialCases) {
      return true;
    }

    // Check custom variables
    if (this.isCustomVariable(key)) {
      return true;
    }

    return false;
  }

  /**
   * Validates the format of an option
   * @param option Option string
   * @returns Whether the option format is valid
   */
  private validateOptionFormat(option: string): boolean {
    const { format } = this.optionRule;
    if (format === '--key=value') {
      return /^--[a-zA-Z0-9-]+=.+$/.test(option);
    } else {
      return /^-[a-zA-Z]=.+$/.test(option);
    }
  }

  /**
   * Checks if an option is a special case
   * @param option Option string
   * @returns Whether the option is a special case
   */
  private isSpecialCase(option: string): boolean {
    return option in this.optionRule.specialCases;
  }

  /**
   * Checks if an option is a custom variable
   * @param key Option key
   * @returns Whether the option is a custom variable
   */
  private isCustomVariable(key: string): boolean {
    return this.optionRule.validation.customVariables.some(pattern => 
      key.startsWith(pattern.replace("*", ""))
    );
  }
} 