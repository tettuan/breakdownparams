import { ParserConfig, ErrorResult, ErrorCode, ErrorCategory } from '../core/params/definitions/types.ts';

export class ConfigValidator {
  validate(config: ParserConfig): ErrorResult | null {
    if (!config.isExtendedMode) {
      return null;
    }

    if (!config.demonstrativeType?.pattern) {
      return {
        message: 'Invalid configuration: pattern is required in extended mode',
        code: ErrorCode.INVALID_CONFIG,
        category: ErrorCategory.CONFIGURATION
      };
    }

    try {
      new RegExp(config.demonstrativeType.pattern);
    } catch (_e) {
      return {
        message: `Invalid configuration: invalid pattern "${config.demonstrativeType.pattern}"`,
        code: ErrorCode.INVALID_CONFIG,
        category: ErrorCategory.CONFIGURATION
      };
    }

    return null;
  }
} 