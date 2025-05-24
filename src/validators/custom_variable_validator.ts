import { BaseValidator } from './validator.ts';
import { ErrorCategory, ErrorCode, ErrorInfo } from '../types.ts';
import { SecurityValidator } from './security_validator.ts';

/**
 * Validator for custom variables
 * 
 * This validator checks if a custom variable name and value are valid.
 * It validates:
 * - Variable name format (alphanumeric and underscores only)
 * - Value length (max 1000 characters)
 * - Forbidden characters in value
 * 
 * @since 1.0.0
 */
export class CustomVariableValidator extends BaseValidator {
  private readonly maxValueLength: number;
  private readonly securityValidator: SecurityValidator;

  constructor() {
    super(ErrorCode.INVALID_CUSTOM_VARIABLE, ErrorCategory.VALIDATION);
    this.maxValueLength = 1000;
    this.securityValidator = new SecurityValidator();
  }

  /**
   * Validates a custom variable name and value
   * 
   * @param value - The value to validate (should be an object with name and value properties)
   * @returns undefined if validation passes, ErrorInfo if validation fails
   */
  validate(value: unknown): ErrorInfo | undefined {
    if (typeof value !== 'object' || value === null) {
      return this.createError('Invalid custom variable format');
    }

    const { name, value: varValue } = value as { name: string; value: string };

    // Validate name
    if (!name) {
      return this.createError('Custom variable name is required');
    }

    const hasSpecialChar = /[^a-zA-Z0-9_]/.test(name);
    if (hasSpecialChar) {
      return this.createError(
        `Invalid custom variable name: ${name}. Only alphanumeric characters and underscores are allowed.`,
        { name }
      );
    }

    // Validate value
    if (varValue === undefined) {
      return this.createError(`Missing value for custom variable: ${name}`);
    }

    if (varValue.length > this.maxValueLength) {
      return this.createError(
        `Value too long for custom variable: ${name}. Maximum length is ${this.maxValueLength} characters.`,
        { name, maxLength: this.maxValueLength }
      );
    }

    // Check for forbidden characters using SecurityValidator
    const securityError = this.securityValidator.validate(varValue);
    if (securityError) {
      return {
        ...securityError,
        details: { ...securityError.details, name, location: `customVariableValue:${name}` },
      };
    }

    return undefined;
  }
} 