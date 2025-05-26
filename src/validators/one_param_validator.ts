import { SingleParamResult } from '../core/params/definitions/types.ts';
import { ErrorFactory } from '../core/errors/error_factory.ts';
import { SecurityValidator } from './security_validator.ts';

/**
 * SingleParamValidator
 * 単一パラメータのバリデーションを担当するクラス
 */
export class SingleParamValidator {
  private readonly securityValidator: SecurityValidator;
  private readonly validCommands: Set<string>;

  constructor() {
    this.securityValidator = new SecurityValidator();
    this.validCommands = new Set(['init']);
  }

  validate(command: string, args: string[]): SingleParamResult {
    const result: SingleParamResult = {
      type: 'single',
      command: 'init',
      options: {},
    };

    // 1. Security validation
    const securityError = this.securityValidator.validate(command);
    if (securityError) {
      result.error = securityError;
      return result;
    }

    // 2. Required field validation
    if (!command) {
      result.error = ErrorFactory.createMissingRequiredArgument('command');
      return result;
    }

    // 3. Command validation
    if (!this.validCommands.has(command)) {
      result.error = ErrorFactory.createInvalidCommand(command);
      return result;
    }

    // 4. Options validation
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
        if (!arg.startsWith('--from') && !arg.startsWith('--destination')) {
          result.error = ErrorFactory.createUnknownOption(arg);
          return result;
        }
      } else if (arg.startsWith('-')) {
        if (arg === '-h' || arg === '-v') {
          continue;
        }
        if (!arg.startsWith('-f') && !arg.startsWith('-o')) {
          result.error = ErrorFactory.createUnknownOption(arg);
          return result;
        }
      }
    }

    return result;
  }
} 