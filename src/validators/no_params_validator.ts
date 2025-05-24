import { NoParamsResult, ErrorInfo } from '../types.ts';
import { SecurityValidator } from './security_validator.ts';
import { ErrorFactory } from '../utils/error_factory.ts';

/**
 * NoParamsValidator
 * パラメータなしのバリデーションを担当するクラス
 */
export class NoParamsValidator {
  private readonly securityValidator: SecurityValidator;

  constructor() {
    this.securityValidator = new SecurityValidator();
  }

  validate(args: string[]): NoParamsResult {
    const result: NoParamsResult = {
      type: 'no-params',
      help: false,
      version: false,
    };

    // Check for help and version flags first
    for (const arg of args) {
      if (arg === '--help' || arg === '-h') {
        result.help = true;
      }
      if (arg === '--version' || arg === '-v') {
        result.version = true;
      }
    }

    // If help or version flags are present, return early
    if (result.help || result.version) {
      return result;
    }

    // Validate other arguments
    for (const arg of args) {
      if (arg.startsWith('--')) {
        if (arg === '--help' || arg === '--version') {
          continue;
        }
        if (arg.startsWith('--uv-')) {
          const securityError = this.securityValidator.validate(arg);
          if (securityError) {
            result.error = ErrorFactory.createInvalidCustomVariable(arg);
            return result;
          }
          continue;
        }
        result.error = ErrorFactory.createUnknownOption(arg);
        return result;
      } else if (arg.startsWith('-')) {
        if (arg === '-h' || arg === '-v') {
          continue;
        }
        result.error = ErrorFactory.createUnknownOption(arg);
        return result;
      }
    }

    return result;
  }
} 