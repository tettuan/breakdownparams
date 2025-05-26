import {
  ErrorInfo,
  Result,
  ParamResult,
  ParseResult,
  ValidationResult,
  BusinessRuleResult,
  ParseError,
  ValidationError,
  BusinessRuleError,
  ErrorCode,
  ErrorCategory,
} from "./types.ts";

/**
 * Factory class for creating result and error objects
 * 
 * This class provides methods for creating various types of results and errors
 * in a consistent way throughout the application.
 * 
 * @since 1.0.0
 */
export class ResultFactory {
  /**
   * Creates a basic result object
   * 
   * @param success - Whether the operation was successful
   * @param data - Optional data to include in the result
   * @param error - Optional error information
   * @returns A Result object
   */
  static createResult<T>(
    success: boolean,
    data?: T,
    error?: ErrorInfo
  ): Result<T> {
    return { success, data, error };
  }

  /**
   * Creates a parameter result object
   * 
   * @param success - Whether the operation was successful
   * @param args - The arguments used in the operation
   * @param data - Optional data to include in the result
   * @param error - Optional error information
   * @returns A ParamResult object
   */
  static createParamResult<T>(
    success: boolean,
    args: string[],
    data?: T,
    error?: ErrorInfo
  ): ParamResult<T> {
    return { success, args, data, error };
  }

  /**
   * Creates a parse result object
   * 
   * @param success - Whether the parsing was successful
   * @param args - The arguments that were parsed
   * @param data - Optional parsed data
   * @param error - Optional parse error
   * @returns A ParseResult object
   */
  static createParseResult(
    success: boolean,
    args: string[],
    data?: unknown,
    error?: ParseError
  ): ParseResult {
    return { success, args, data, error };
  }

  /**
   * Creates a validation result object
   * 
   * @param success - Whether the validation was successful
   * @param args - The arguments that were validated
   * @param data - Optional validation data
   * @param error - Optional validation error
   * @returns A ValidationResult object
   */
  static createValidationResult(
    success: boolean,
    args: string[],
    data?: unknown,
    error?: ValidationError
  ): ValidationResult {
    return { success, args, data, error };
  }

  /**
   * Creates a business rule result object
   * 
   * @param success - Whether the business rule validation was successful
   * @param args - The arguments that were validated
   * @param data - Optional validation data
   * @param error - Optional business rule error
   * @returns A BusinessRuleResult object
   */
  static createBusinessRuleResult(
    success: boolean,
    args: string[],
    data?: unknown,
    error?: BusinessRuleError
  ): BusinessRuleResult {
    return { success, args, data, error };
  }

  /**
   * Creates a basic error object
   * 
   * @param message - The error message
   * @param code - The error code
   * @param category - The error category
   * @param details - Optional additional error details
   * @returns An ErrorInfo object
   */
  static createError(
    message: string,
    code: ErrorCode,
    category: ErrorCategory,
    details?: Record<string, unknown>
  ): ErrorInfo {
    return { message, code, category, details };
  }

  /**
   * Creates a parse error object
   * 
   * @param message - The error message
   * @param code - The error code
   * @param position - Optional position where the error occurred
   * @param expected - Optional expected value
   * @returns A ParseError object
   */
  static createParseError(
    message: string,
    code: ErrorCode,
    position?: number,
    expected?: unknown
  ): ParseError {
    return {
      message,
      code,
      category: ErrorCategory.SYNTAX,
      details: { position, expected }
    };
  }

  /**
   * Creates a validation error object
   * 
   * @param message - The error message
   * @param code - The error code
   * @param provided - The provided values that caused the error
   * @param expected - Optional expected values
   * @returns A ValidationError object
   */
  static createValidationError(
    message: string,
    code: ErrorCode,
    provided: string[],
    expected?: unknown
  ): ValidationError {
    return {
      message,
      code,
      category: ErrorCategory.VALIDATION,
      details: { provided, expected }
    };
  }

  /**
   * Creates a business rule error object
   * 
   * @param message - The error message
   * @param code - The error code
   * @param rule - The rule that was violated
   * @param context - Optional context information
   * @returns A BusinessRuleError object
   */
  static createBusinessRuleError(
    message: string,
    code: ErrorCode,
    rule: string,
    context?: unknown
  ): BusinessRuleError {
    return {
      message,
      code,
      category: ErrorCategory.BUSINESS,
      details: { context },
      rule
    };
  }
} 