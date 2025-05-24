import { BaseValidator } from './validator.ts';
import { ErrorCategory, ErrorCode, ErrorInfo } from '../types.ts';

/**
 * Validator for required fields
 * 
 * This validator checks if a required field is present and not empty.
 * It can be used for both string values and array values.
 * 
 * @since 1.0.0
 */
export class RequiredFieldValidator extends BaseValidator {
  private readonly fieldName: string;

  constructor(fieldName: string) {
    super(ErrorCode.MISSING_REQUIRED_ARGUMENT, ErrorCategory.VALIDATION);
    this.fieldName = fieldName;
  }

  /**
   * Validates that the given value is present and not empty
   * 
   * @param value - The value to validate
   * @returns undefined if validation passes, ErrorInfo if validation fails
   */
  validate(value: unknown): ErrorInfo | undefined {
    if (value === undefined || value === null) {
      return this.createError(
        `Required argument ${this.fieldName} is missing.`,
        { field: this.fieldName }
      );
    }

    if (typeof value === 'string' && value.trim() === '') {
      return this.createError(
        `Required argument ${this.fieldName} is empty.`,
        { field: this.fieldName }
      );
    }

    if (Array.isArray(value) && value.length === 0) {
      return this.createError(
        `Required argument ${this.fieldName} is an empty list.`,
        { field: this.fieldName }
      );
    }

    return undefined;
  }
} 