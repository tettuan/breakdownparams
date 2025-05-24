import { ErrorCategory, ErrorCode, ErrorInfo } from '../types.ts';

/**
 * Validator interface for parameter validation
 * 
 * This interface defines the contract for all validators in the system.
 * Each validator must implement the validate method that takes a value and returns
 * either undefined (if validation passes) or an ErrorInfo object (if validation fails).
 * 
 * @since 1.0.0
 */
export interface Validator {
  /**
   * Validates the given value
   * 
   * @param value - The value to validate
   * @param context - Optional context information for validation
   * @returns undefined if validation passes, ErrorInfo if validation fails
   */
  validate(value: unknown, context?: Record<string, unknown>): ErrorInfo | undefined;
}

/**
 * Base class for all validators
 * 
 * This class provides common functionality for all validators.
 * It includes methods for creating error objects and handling common validation scenarios.
 * 
 * @since 1.0.0
 */
export abstract class BaseValidator implements Validator {
  protected readonly errorCode: ErrorCode;
  protected readonly errorCategory: ErrorCategory;

  constructor(errorCode: ErrorCode, errorCategory: ErrorCategory) {
    this.errorCode = errorCode;
    this.errorCategory = errorCategory;
  }

  /**
   * Creates an error info object
   * 
   * @param message - The error message
   * @param details - Optional details about the error
   * @returns An ErrorInfo object
   */
  protected createError(message: string, details?: Record<string, unknown>): ErrorInfo {
    return {
      message,
      code: this.errorCode,
      category: this.errorCategory,
      details,
    };
  }

  abstract validate(value: unknown, context?: Record<string, unknown>): ErrorInfo | undefined;
} 