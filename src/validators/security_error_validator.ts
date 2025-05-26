import { BaseValidator } from "../core/errors/validators/base_validator.ts";
import { ERROR_CODES, ERROR_CATEGORIES } from "../core/errors/constants.ts";
import { ParseResult, ParamPatternResult } from "../core/params/definitions/types.ts";

export class SecurityErrorValidator extends BaseValidator {
  constructor() {
    super(ERROR_CODES.SECURITY_ERROR, ERROR_CATEGORIES.SECURITY);
  }

  canHandle(args: string[]): boolean {
    return args.length > 0;
  }

  validate(args: string[]): ParseResult<ParamPatternResult> {
    const value = args[0];
    if (!value) {
      return this.createSuccessResult({
        type: 'zero',
        help: false,
        version: false
      });
    }

    // Check for command injection attempts
    if (/[;&|`$]/.test(value)) {
      return this.createErrorResult("Security violation: Command injection attempt detected");
    }

    // Check for path traversal attempts
    if (/\.\.\//.test(value)) {
      return this.createErrorResult("Security violation: Path traversal attempt detected");
    }

    // Check for SQL injection attempts
    if (/['";]/.test(value)) {
      return this.createErrorResult("Security violation: SQL injection attempt detected");
    }

    return this.createSuccessResult({
      type: 'zero',
      help: false,
      version: false
    });
  }
} 