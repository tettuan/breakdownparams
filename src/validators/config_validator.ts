import { ErrorResult } from '../types.ts';

export class ConfigValidator {
  validate(config: { isExtendedMode?: boolean; demonstrativeType?: { pattern?: string } }): ErrorResult | null {
    // If not in extended mode or config is empty, no validation needed
    if (!config.isExtendedMode || Object.keys(config).length === 0) {
      return null;
    }

    // In extended mode, pattern is required
    if (!config.demonstrativeType?.pattern) {
      return {
        code: 'INVALID_CONFIG',
        message: 'In extended mode, pattern is required for demonstrativeType'
      };
    }

    // Validate pattern is not empty or whitespace
    if (!config.demonstrativeType.pattern.trim()) {
      return {
        code: 'INVALID_CONFIG',
        message: 'In extended mode, pattern is required for demonstrativeType'
      };
    }

    // Validate pattern is a valid regex
    try {
      new RegExp(config.demonstrativeType.pattern);
    } catch (e) {
      return {
        code: 'INVALID_CONFIG',
        message: 'invalid pattern in demonstrativeType configuration'
      };
    }

    return null;
  }
} 