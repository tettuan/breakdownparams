import { BaseValidator } from './params/base_validator.ts';
import type { ValidationResult } from '../types/validation_result.ts';

/**
 * Security validator for command-line arguments.
 *
 * This validator checks for potentially harmful strings in parameters
 * that could compromise system security. It prevents command injection,
 * path traversal, and other security vulnerabilities.
 *
 * @extends BaseValidator
 *
 * @example
 * ```ts
 * const validator = new SecurityValidator();
 * const result = validator.validate(["normal", "args"]);
 * // { isValid: true, validatedParams: ["normal", "args"] }
 *
 * const dangerous = validator.validate(["rm -rf /", "; cat /etc/passwd"]);
 * // { isValid: false, errorMessage: "Security error..." }
 * ```
 */
export class SecurityValidator extends BaseValidator {
  /**
   * Creates a new SecurityValidator instance.
   */
  constructor() {
    super();
  }

  /**
   * Validates command-line arguments for security threats.
   *
   * Checks for:
   * - Shell command injection attempts (;, |, &, <, >)
   * - Path traversal attempts (../, ..\, and direct concatenations)
   *
   * @param args - Array of command-line arguments to validate
   * @returns Validation result with security check status
   *
   * @example
   * ```ts
   * validator.validate(["--file=../../../etc/passwd"]);
   * // { isValid: false, errorCode: "SECURITY_ERROR" }
   *
   * validator.validate(["test.txt", "--verbose"]);
   * // { isValid: true, validatedParams: [...] }
   * ```
   */
  public validate(args: string[]): ValidationResult {
    // Detect shell command execution attempts and redirect symbols
    if (args.some((arg) => /[;|&<>]/.test(arg))) {
      return {
        isValid: false,
        validatedParams: args,
        errorMessage: 'Security error: Shell command execution or redirection attempt detected',
        errorCode: 'SECURITY_ERROR',
        errorCategory: 'security',
      };
    }

    // Detect path traversal attempts (../, ..\, including direct concatenation)
    if (args.some((arg) => /\.\.(\/|\\|[a-zA-Z0-9_\-\.])/g.test(arg))) {
      return {
        isValid: false,
        validatedParams: args,
        errorMessage: 'Security error: Path traversal attempt detected',
        errorCode: 'SECURITY_ERROR',
        errorCategory: 'security',
      };
    }

    return {
      isValid: true,
      validatedParams: args,
      errors: [],
    };
  }
}
