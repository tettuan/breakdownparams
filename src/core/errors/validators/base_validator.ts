import {
  ErrorCategory,
  ErrorCode,
  ErrorInfo,
  ParamPatternResult,
  ParamPatternValidator,
  ParseResult,
} from '../../params/definitions/types.ts';
import { ERROR_CATEGORIES, ERROR_CODES } from '../constants.ts';

/**
 * Base class for parameter pattern validators
 */
export abstract class BaseValidator implements ParamPatternValidator {
  protected readonly errorCode: ErrorCode;
  protected readonly errorCategory: ErrorCategory;

  constructor(errorCode: ErrorCode, errorCategory: ErrorCategory) {
    this.errorCode = errorCode;
    this.errorCategory = errorCategory;
  }

  /**
   * Determines if this validator can handle the given arguments
   * @param args The arguments to check
   * @returns True if this validator can handle the arguments
   */
  abstract canHandle(args: string[]): boolean;

  /**
   * Validates the parameter pattern
   * @param args The arguments to validate
   * @returns The validation result
   */
  abstract validate(args: string[]): ParseResult<ParamPatternResult>;

  /**
   * Creates a success result
   * @param data The parameters to include in the result
   * @returns The success result
   */
  protected createSuccessResult(data: ParamPatternResult): ParseResult<ParamPatternResult> {
    return {
      success: true,
      data,
    };
  }

  /**
   * Creates an error result
   * @param message The error message
   * @param details Optional error details
   * @returns The error result
   */
  protected createErrorResult(
    message: string,
    details?: Record<string, unknown>,
  ): ParseResult<ParamPatternResult> {
    return {
      success: false,
      error: {
        message,
        code: this.errorCode,
        category: this.errorCategory,
        details,
      },
    };
  }

  /**
   * Creates an error object with the given message, code, category, and optional details.
   * @param message - The error message
   * @param code - The error code
   * @param category - The error category
   * @param details - Optional error details
   * @returns An error info object
   */
  protected createError(
    message: string,
    code: ErrorCode = ERROR_CODES.INVALID_OPTION,
    category: ErrorCategory = ERROR_CATEGORIES.VALIDATION,
    details?: Record<string, unknown>,
  ): ErrorInfo {
    return {
      message,
      code,
      category,
      details,
    };
  }
}
