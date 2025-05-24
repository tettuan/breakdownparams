import { ErrorCategory, ErrorCode, ErrorInfo, ErrorResult } from '../core/params/definitions/types.ts';
import { BaseValidator } from './validator.ts';

export class SecurityValidator extends BaseValidator {
  private readonly forbiddenChars = [';', '&', '`'];

  constructor() {
    super(ErrorCode.SECURITY_ERROR, ErrorCategory.SECURITY);
  }

  /**
   * Validates a parameter for security issues.
   * @param value The parameter to validate
   * @param _context Optional context information
   * @returns ErrorInfo if validation fails, undefined if validation passes
   */
  public validate(value: unknown, _context?: Record<string, unknown>): ErrorInfo | undefined {
    if (typeof value !== 'string') {
      return this.createError('Value must be a string');
    }

    for (const c of this.forbiddenChars) {
      if (value.includes(c)) {
        return this.createError(
          `Security error: character '${c}' is not allowed in parameters`,
          { forbiddenChar: c }
        );
      }
    }
    return undefined;
  }

  validatePattern(pattern: string): ErrorResult | null {
    const foundChars = this.forbiddenChars.filter(char => pattern.includes(char));
    if (foundChars.length === 0) {
      return null;
    }

    return {
      message: `Security error: characters "${foundChars.join(', ')}" are not allowed in pattern`,
      code: ErrorCode.SECURITY_ERROR,
      category: ErrorCategory.SECURITY
    };
  }
} 