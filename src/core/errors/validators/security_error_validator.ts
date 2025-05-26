import { BaseValidator } from "./base_validator.ts";
import { ERROR_CODES, ERROR_CATEGORIES } from "../constants.ts";
import { ParseResult, ParamPatternResult } from "../../params/definitions/types.ts";

/**
 * Validator for security-related errors
 */
export class SecurityErrorValidator extends BaseValidator {
  constructor() {
    super(ERROR_CODES.SECURITY_ERROR, ERROR_CATEGORIES.SECURITY);
  }

  /**
   * Validates arguments for security issues
   * @param args The arguments to validate
   * @returns The validation result
   */
  validate(args: string[]): ParseResult<ParamPatternResult> {
    // Check all arguments for security issues
    for (const arg of args) {
      // Check for command injection attempts
      if (/[;&|`$]/.test(arg)) {
        return this.createErrorResult("Security violation: Command injection attempt detected");
      }

      // Check for path traversal attempts
      if (/\.\.\//.test(arg)) {
        return this.createErrorResult("Security violation: Path traversal attempt detected");
      }

      // Check for SQL injection attempts
      if (/['";]/.test(arg)) {
        return this.createErrorResult("Security violation: SQL injection attempt detected");
      }

      // Check for option injection attempts
      if (arg.startsWith('-') && /[;&|`$]/.test(arg)) {
        return this.createErrorResult("Security violation: Option injection attempt detected");
      }
    }

    return this.createSuccessResult({
      type: 'zero',
      help: false,
      version: false
    });
  }

  /**
   * Determines if this validator can handle the given arguments
   * @param args The arguments to check
   * @returns True if this validator can handle the arguments
   */
  canHandle(args: string[]): boolean {
    return args.length > 0;
  }
} 