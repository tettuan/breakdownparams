import { ErrorInfo, ErrorCode, ErrorCategory } from '../../errors/types.ts';
import { BaseValidator } from './base_validator.ts';
import { ParseResult, ParamPatternResult } from '../types.ts';

/**
 * Validator for security error checks
 */
export class SecurityErrorValidator extends BaseValidator {
  /**
   * Determines if this validator can handle the given arguments
   * @param args The arguments to check
   * @returns True if this validator can handle the arguments
   */
  canHandle(args: string[]): boolean {
    return args.length > 0;
  }

  /**
   * Validates the arguments for security issues
   * @param args The arguments to validate
   * @returns The validation result
   */
  validate(args: string[]): ParseResult<ParamPatternResult> {
    // Check for path traversal attempts
    if (args.some(arg => arg.includes('..'))) {
      return this.createErrorResult({
        message: 'Path traversal attempt detected',
        code: ErrorCode.SECURITY_VIOLATION,
        category: ErrorCategory.SECURITY,
        details: { type: 'PATH_TRAVERSAL' }
      });
    }

    // Check for command injection attempts
    if (args.some(arg => arg.includes(';') || arg.includes('|') || arg.includes('&'))) {
      return this.createErrorResult({
        message: 'Command injection attempt detected',
        code: ErrorCode.SECURITY_VIOLATION,
        category: ErrorCategory.SECURITY,
        details: { type: 'COMMAND_INJECTION' }
      });
    }

    return this.createSuccessResult({
      type: 'zero',
      help: false,
      version: false
    });
  }
} 