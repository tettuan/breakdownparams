import { BaseValidator } from './base_validator.ts';
import { ValidationResult } from '../../types/validation_result.ts';

/**
 * Validator for single-parameter commands.
 *
 * This validator ensures exactly one parameter is provided
 * and currently only accepts the "init" command. This is used
 * for initialization or setup commands that don't require additional arguments.
 *
 * @extends BaseValidator
 *
 * @example
 * ```ts
 * const validator = new OneParamValidator();
 *
 * // Valid: init command
 * validator.validate(["init"]); // { isValid: true, directiveType: "init" }
 *
 * // Invalid: wrong command
 * validator.validate(["start"]); // { isValid: false, errorMessage: "Invalid command: start..." }
 *
 * // Invalid: wrong parameter count
 * validator.validate(["init", "extra"]); // { isValid: false, errorMessage: "Expected exactly one parameter" }
 * ```
 */
export class OneParamValidator extends BaseValidator {
  /**
   * Validates that exactly one parameter is provided and it's "init".
   *
   * @param params - Array of parameters to validate
   * @returns Validation result with directiveType if valid
   *
   * @example
   * ```ts
   * const result = validator.validate(["init"]);
   * if (result.isValid) {
   *   // result.directiveType === "init"
   * }
   * ```
   */
  override validate(params: string[]): ValidationResult {
    if (params.length !== 1) {
      return {
        isValid: false,
        validatedParams: params,
        errorMessage: 'Expected exactly one parameter',
        errorCode: 'INVALID_PARAMS',
        errorCategory: 'validation',
      };
    }

    const isValid = params[0] === 'init';
    return {
      isValid,
      validatedParams: params,
      directiveType: params[0],
      errorMessage: isValid ? undefined : `Invalid command: ${params[0]}. Only "init" is allowed`,
      errorCode: isValid ? undefined : 'INVALID_COMMAND',
      errorCategory: isValid ? undefined : 'validation',
    };
  }
}
