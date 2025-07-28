import { BaseValidator } from './base_validator.ts';
import { ValidationResult } from '../../types/validation_result.ts';

/**
 * Validator for zero-parameter commands.
 *
 * This validator ensures that no parameters are provided,
 * typically used for commands that only accept options
 * like --help or --version without any positional arguments.
 *
 * @extends BaseValidator
 *
 * @example
 * ```ts
 * const validator = new ZeroParamsValidator();
 *
 * // Valid: no parameters
 * validator.validate([]); // { isValid: true }
 *
 * // Invalid: has parameters
 * validator.validate(["param"]); // { isValid: false, errorMessage: "Expected zero parameters" }
 * ```
 */
export class ZeroParamsValidator extends BaseValidator {
  /**
   * Validates that exactly zero parameters are provided.
   *
   * @param params - Array of parameters to validate
   * @returns Validation result indicating if params array is empty
   *
   * @example
   * ```ts
   * // Usage with options only
   * const args = ["--help", "--verbose"]; // After filtering, params = []
   * validator.validate([]); // { isValid: true }
   * ```
   */
  override validate(params: string[]): ValidationResult {
    // Valid if no parameters
    if (params.length === 0) {
      return {
        isValid: true,
        validatedParams: [],
      };
    }

    // Otherwise invalid
    return {
      isValid: false,
      validatedParams: [],
      errorMessage: 'Expected zero parameters',
      errorCode: 'INVALID_PARAMS',
      errorCategory: 'validation',
    };
  }
}
