import {
  OneParamResult,
  ParamPatternResult,
  ParseResult,
} from '../core/params/definitions/types.ts';
import { ErrorInfo } from '../core/errors/types.ts';
import { SecurityErrorValidator } from '../core/errors/validators/security_error_validator.ts';
import { BaseValidator } from '../core/errors/validators/base_validator.ts';
import { ErrorFactory } from '../core/errors/error_factory.ts';
import { ValidatorFactory } from './validator_factory.ts';
import { ERROR_CATEGORIES, ERROR_CODES } from '../core/errors/constants.ts';

/**
 * OneParamValidator
 * Validates single parameter commands
 */
export class OneParamValidator extends BaseValidator {
  private readonly securityValidator: SecurityErrorValidator;
  private readonly validCommands: Set<string>;

  constructor() {
    super(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
    const validatorFactory = ValidatorFactory.getInstance();
    this.securityValidator = validatorFactory.createSecurityValidator();
    this.validCommands = new Set(['init']);
  }

  /**
   * Validates the given arguments and returns a parse result.
   * @param args - The command line arguments to validate
   * @returns A parse result containing either the validated parameters or an error
   */
  public validate(args: string[]): ParseResult<ParamPatternResult> {
    // Split arguments into command and options
    const [command, ...options] = args;

    // Check if command is valid
    if (!command || typeof command !== 'string') {
      return {
        success: false,
        error: {
          message: 'Command must be a string',
          code: ERROR_CODES.VALIDATION_ERROR,
          category: ERROR_CATEGORIES.VALIDATION,
          details: {
            provided: command,
            validCommands: Array.from(this.validCommands),
          },
        },
        args,
        data: {
          type: 'one',
          command: '',
          options: {},
        } as OneParamResult,
      };
    }

    const commandLower = command.toLowerCase();

    // Check for security issues
    const securityError = this.securityValidator.validate([commandLower]);
    if (securityError && !securityError.success) {
      return {
        success: false,
        error: {
          message: securityError.error!.message,
          code: ERROR_CODES.VALIDATION_ERROR,
          category: ERROR_CATEGORIES.VALIDATION,
        },
        args,
        data: {
          type: 'one',
          command: '',
          options: {},
        } as OneParamResult,
      };
    }

    // Check if command is valid
    if (!this.validCommands.has(commandLower)) {
      return {
        success: false,
        error: {
          message: `Invalid command: ${commandLower}. Must be one of: ${
            Array.from(this.validCommands).join(', ')
          }`,
          code: ERROR_CODES.VALIDATION_ERROR,
          category: ERROR_CATEGORIES.VALIDATION,
          details: {
            provided: commandLower,
            validCommands: Array.from(this.validCommands),
          },
        },
        args,
        data: {
          type: 'one',
          command: '',
          options: {},
        } as OneParamResult,
      };
    }

    // Parse options
    const optionsResult = this.parseOptions(options);
    if (optionsResult.error) {
      return {
        success: false,
        error: {
          ...optionsResult.error,
          code: ERROR_CODES.VALIDATION_ERROR,
          category: ERROR_CATEGORIES.VALIDATION,
        },
        args,
        data: {
          type: 'one',
          command: '',
          options: {},
        } as OneParamResult,
      };
    }

    // Return success
    return {
      success: true,
      data: {
        type: 'one',
        command: commandLower,
        options: optionsResult.options,
      },
      args,
    };
  }

  /**
   * Determines if this validator can handle the given arguments.
   * @param args - The command line arguments to check
   * @returns True if this validator can handle the arguments, false otherwise
   */
  public canHandle(args: string[]): boolean {
    return args.length > 0 && !args[0].startsWith('-');
  }

  /**
   * Parses options from command arguments
   * @param args - The command arguments to parse
   * @returns The parsed options or an error
   */
  private parseOptions(args: string[]): { options: Record<string, string>; error?: ErrorInfo } {
    const options: Record<string, string> = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg.startsWith('--')) {
        if (arg === '--help' || arg === '--version') {
          continue;
        }
        // Check for security issues
        const securityError = this.securityValidator.validate([arg]);
        if (securityError && !securityError.success) {
          return { options: {}, error: securityError.error };
        }
        // Parse option value
        if (arg === '--from') {
          if (i + 1 >= args.length) {
            return { options: {}, error: ErrorFactory.createMissingOptionValue('--from') };
          }
          options['fromFile'] = args[++i];
        } else if (arg === '--destination') {
          if (i + 1 >= args.length) {
            return { options: {}, error: ErrorFactory.createMissingOptionValue('--destination') };
          }
          options['destinationFile'] = args[++i];
        } else if (arg.includes('=')) {
          const [key, value] = arg.split('=');
          if (key === '--from') {
            options['fromFile'] = value;
          } else if (key === '--destination') {
            options['destinationFile'] = value;
          } else {
            // 未知のオプションも許容する
            if (!value) {
              return { options: {}, error: ErrorFactory.createMissingOptionValue(key) };
            }
            options[key.slice(2)] = value;
          }
        } else {
          // 未知のオプションも許容する
          continue;
        }
      } else if (arg === '-f') {
        if (i + 1 >= args.length) {
          return { options: {}, error: ErrorFactory.createMissingOptionValue('-f') };
        }
        options['fromFile'] = args[++i];
      } else if (arg === '-o') {
        if (i + 1 >= args.length) {
          return { options: {}, error: ErrorFactory.createMissingOptionValue('-o') };
        }
        options['destinationFile'] = args[++i];
      } else if (arg.startsWith('-f=')) {
        options['fromFile'] = arg.substring(3);
      } else if (arg.startsWith('-o=')) {
        options['destinationFile'] = arg.substring(3);
      } else if (arg.startsWith('-')) {
        if (arg === '-h' || arg === '-v') {
          continue;
        }
        // Check for security issues
        const securityError = this.securityValidator.validate([arg]);
        if (securityError && !securityError.success) {
          return { options: {}, error: securityError.error };
        }
        // Parse other short options (single letter)
        const key = arg.slice(1);
        if (i + 1 >= args.length) {
          return { options: {}, error: ErrorFactory.createMissingOptionValue(key) };
        }
        options[key] = args[++i];
      }
    }

    return { options };
  }

  /**
   * Checks if an option is valid
   * @param key - The option key to check
   * @returns True if the option is valid, false otherwise
   */
  private isValidOption(key: string): boolean {
    const validOptions = ['--from', '--destination', '--uv-', 'f', 'o'];
    return validOptions.some((option) => key.startsWith(option));
  }
}
