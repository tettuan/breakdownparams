import type { ValidationResult } from '../../types/validation_result.ts';

/**
 * Base abstract class for all parameter validators.
 *
 * This class defines the contract for parameter validation.
 * All validators must implement the validate method to perform
 * specific validation logic on command-line parameters.
 *
 * @abstract
 *
 * @example
 * ```ts
 * // Concrete implementation example
 * class MyValidator extends BaseValidator {
 *   validate(params: string[]): ValidationResult {
 *     // Custom validation logic
 *     return {
 *       isValid: true,
 *       validatedParams: params
 *     };
 *   }
 * }
 * ```
 */
export abstract class BaseValidator {
  /**
   * Validates the provided parameters.
   *
   * Each concrete validator implements this method to perform
   * specific validation rules based on the parameter requirements.
   *
   * @param params - Array of parameters to validate
   * @returns Validation result containing success status and validated parameters
   * @abstract
   *
   * @example
   * ```ts
   * const result = validator.validate(["param1", "param2"]);
   * if (result.isValid) {
   *   // Use result.validatedParams
   * } else {
   *   // Handle validation error
   *   // result.errorMessage contains the error details
   * }
   * ```
   */
  abstract validate(params: string[]): ValidationResult;
}
