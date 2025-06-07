import { BaseValidator } from './base_validator.ts';
import { ValidationResult } from '../result/types.ts';

/**
 * Parameter-specific option validator
 * Validates options based on the number of parameters
 */
export class ParamSpecificOptionValidator extends BaseValidator {
  /**
   * Validates options for zero parameters
   * @param options Options to validate
   * @returns Validation result
   */
  public validateForZero(options: Record<string, string | undefined>): ValidationResult {
    const rules = this.optionRule.paramSpecificOptions.zero;
    return this.validateOptions(options, rules);
  }

  /**
   * Validates options for one parameter
   * @param options Options to validate
   * @returns Validation result
   */
  public validateForOne(options: Record<string, string | undefined>): ValidationResult {
    const rules = this.optionRule.paramSpecificOptions.one;
    return this.validateOptions(options, rules);
  }

  /**
   * Validates options for two parameters
   * @param options Options to validate
   * @returns Validation result
   */
  public validateForTwo(options: Record<string, string | undefined>): ValidationResult {
    const rules = this.optionRule.paramSpecificOptions.two;
    return this.validateOptions(options, rules);
  }

  /**
   * Validates options against the given rules
   * @param options Options to validate
   * @param rules Rules to validate against
   * @returns Validation result
   */
  private validateOptions(
    options: Record<string, string | undefined>,
    rules: { allowedOptions: string[]; requiredOptions: string[] },
  ): ValidationResult {
    // Check for unknown options
    const unknownOptions = Object.keys(options).filter(
      (key) => !rules.allowedOptions.includes(key),
    );
    if (unknownOptions.length > 0) {
      return this.createErrorResult(
        `Unknown options: ${unknownOptions.join(', ')}`,
        'VALIDATION_ERROR',
        'unknown_options',
      );
    }

    // Check for required options
    const missingOptions = rules.requiredOptions.filter(
      (key) => !(key in options),
    );
    if (missingOptions.length > 0) {
      return this.createErrorResult(
        `Missing required options: ${missingOptions.join(', ')}`,
        'VALIDATION_ERROR',
        'missing_options',
      );
    }

    return this.createSuccessResult([]);
  }

  /**
   * Validates the given arguments
   * @param args Arguments to validate
   * @returns Validation result
   */
  public override validate(args: string[]): ValidationResult {
    // Extract options from args
    const options: Record<string, string | undefined> = {};
    for (const arg of args) {
      if (arg.startsWith('-')) {
        const [key, value] = arg.split('=');
        const normalizedKey = key.replace(/^--/, '');
        options[normalizedKey] = value || undefined;
      }
    }

    // Count non-option arguments
    const paramCount = args.filter((arg) => !arg.startsWith('-')).length;

    // Validate based on parameter count
    switch (paramCount) {
      case 0:
        return this.validateForZero(options);
      case 1:
        return this.validateForOne(options);
      case 2:
        return this.validateForTwo(options);
      default:
        return this.createErrorResult(
          'Invalid number of parameters',
          'VALIDATION_ERROR',
          'invalid_param_count',
        );
    }
  }
}
