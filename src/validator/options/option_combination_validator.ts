import {
  DEFAULT_OPTION_COMBINATION_RULES,
  OptionCombinationRule,
} from './option_combination_rule.ts';

/**
 * Interface representing the result of option combination validation
 * Contains detailed information about validation results (success/failure, error message, error code, category)
 */
export interface OptionCombinationResult {
  /**
   * Flag indicating whether validation was successful
   * true: validation successful, false: validation failed
   */
  isValid: boolean;

  /**
   * Error message when validation fails
   * Undefined when validation succeeds
   */
  errorMessage?: string;

  /**
   * Error code when validation fails
   * Undefined when validation succeeds
   */
  errorCode?: string;

  /**
   * Error category when validation fails
   * Undefined when validation succeeds
   */
  errorCategory?: string;
}

/**
 * Class that validates combinations of command-line options
 *
 * This class performs the following validations:
 * 1. Whether any disallowed options are specified
 * 2. Whether all required options are specified
 * 3. Whether option dependencies (combination rules) are satisfied
 */
export class OptionCombinationValidator {
  private readonly userVariablePattern = /^uv-[a-zA-Z][a-zA-Z0-9_-]*$/;

  /**
   * @param rule - Object defining option combination rules
   */
  constructor(private rule: OptionCombinationRule) {}

  /**
   * Validates whether the specified option combination matches the rules
   *
   * Validation flow:
   * 1. Check for disallowed options
   * 2. Check for existence of required options
   * 3. Check option dependencies
   *
   * @param options - Options to validate (key-value pairs)
   * @returns Validation result (success/failure and error information)
   */
  validate(options: Record<string, unknown>): OptionCombinationResult {
    // Check if any disallowed options are included
    for (const key of Object.keys(options)) {
      // User variables (uv-*) are treated specially - only allowed in TwoParams mode
      if (key.startsWith('uv-')) {
        // Check user variable format
        if (!this.isValidUserVariableName(key)) {
          return {
            isValid: false,
            errorMessage: `Invalid user variable format: ${key}`,
            errorCode: 'INVALID_USER_VARIABLE',
            errorCategory: 'validation',
          };
        }
        // Skip allowedOptions check for user variables
        continue;
      }

      if (!this.rule.allowedOptions.includes(key)) {
        return {
          isValid: false,
          errorMessage: `Option '${key}' is not allowed`,
          errorCode: 'INVALID_OPTION',
          errorCategory: 'validation',
        };
      }
    }

    // Check if all required options are included
    if (this.rule.requiredOptions) {
      for (const req of this.rule.requiredOptions) {
        if (!(req in options)) {
          return {
            isValid: false,
            errorMessage: `Required option '${req}' is missing`,
            errorCode: 'MISSING_REQUIRED_OPTION',
            errorCategory: 'validation',
          };
        }
      }
    }

    // Validate combination rules
    if (this.rule.combinationRules) {
      for (const [key, required] of Object.entries(this.rule.combinationRules)) {
        if (key in options) {
          for (const req of required) {
            if (!(req in options)) {
              return {
                isValid: false,
                errorMessage: `Option '${key}' requires '${req}' to be specified`,
                errorCode: 'INVALID_OPTION_COMBINATION',
                errorCategory: 'validation',
              };
            }
          }
        }
      }
    }

    return { isValid: true };
  }

  /**
   * Check the format of user variable name
   * @param name - Variable name to check
   * @returns true if the format is valid
   */
  private isValidUserVariableName(name: string): boolean {
    return this.userVariablePattern.test(name);
  }

  /**
   * Static method that extracts options from command-line arguments and validates their combination
   *
   * Processing flow:
   * 1. Extract options from command-line arguments (process arguments starting with --)
   * 2. Get rules according to parameter type and initialize validator
   * 3. Execute validation on extracted options based on selected rules
   * 4. Return validation result (success/failure and error information)
   *
   * @param args - Array of command-line arguments
   * @param type - Parameter type ('zero' | 'one' | 'two')
   * @returns Validation result (success/failure and error information)
   */
  static validate(args: string[], type: 'zero' | 'one' | 'two'): OptionCombinationResult {
    const options: Record<string, unknown> = {};
    for (const arg of args) {
      if (arg.startsWith('--')) {
        const [key, value] = arg.slice(2).split('=');
        options[key] = value || true;
      }
    }

    // Get rules according to parameter type and initialize validator
    // Select appropriate rule set from DEFAULT_OPTION_COMBINATION_RULES
    // based on type: 'zero' | 'one' | 'two'
    const validator = new OptionCombinationValidator(DEFAULT_OPTION_COMBINATION_RULES[type]);

    // Execute validation on extracted options based on selected rules
    // Return validation result (success/failure and error information)
    return validator.validate(options);
  }
}
