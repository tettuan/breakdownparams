import { ZeroParamResult, ParseResult, ParamPatternResult } from '../core/params/definitions/types.ts';
import { BaseValidator } from '../core/errors/validators/base_validator.ts';
import { ERROR_CODES, ERROR_CATEGORIES } from '../core/errors/constants.ts';
import { ErrorFactory } from '../core/errors/error_factory.ts';
import { SecurityErrorValidator } from '../core/errors/validators/security_error_validator.ts';
import { ValidatorFactory } from './validator_factory.ts';

/**
 * Validator for commands with zero parameters
 */
export class ZeroParamsValidator extends BaseValidator {
  private readonly securityValidator: SecurityErrorValidator;

  constructor() {
    super(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
    const validatorFactory = ValidatorFactory.getInstance();
    this.securityValidator = validatorFactory.createSecurityValidator();
  }

  /**
   * Validates arguments for a command with zero parameters
   * @param args The arguments to validate
   * @returns The validation result
   */
  validate(args: string[]): ParseResult<ParamPatternResult> {
    const nonOptionArgs = args.filter(arg => !arg.startsWith('-'));
    if (nonOptionArgs.length > 0) {
      return {
        success: false,
        error: {
          message: 'No parameters expected',
          code: ERROR_CODES.VALIDATION_ERROR,
          category: ERROR_CATEGORIES.VALIDATION
        },
        args,
        data: {
          type: 'zero',
          help: false,
          version: false
        } as ZeroParamResult
      };
    }

    // Parse options
    let help = false;
    let version = false;

    // 引数が空の場合は help: true, version: false で返す
    if (args.length === 0) {
      return {
        success: true,
        data: {
          type: 'zero',
          help: true,
          version: false
        },
        args
      };
    }

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '--help' || arg === '-h') {
        help = true;
      } else if (arg === '--version' || arg === '-v') {
        version = true;
      } else if (arg.startsWith('--')) {
        // Check for security issues
        const securityError = this.securityValidator.validate([arg]);
        if (!securityError.success) {
          return {
            success: false,
            error: {
              message: securityError.error!.message,
              code: ERROR_CODES.VALIDATION_ERROR,
              category: ERROR_CATEGORIES.VALIDATION
            },
            args,
            data: {
              type: 'zero',
              help: false,
              version: false
            } as ZeroParamResult
          };
        }

        const [key, value] = arg.split('=');
        if (key.startsWith('--uv-')) {
          // Validate custom variable name
          const varName = key.slice(5); // Remove '--uv-'
          if (!/^[a-zA-Z0-9_]+$/.test(varName)) {
            return {
              success: false,
              error: {
                message: 'Invalid custom variable name',
                code: ERROR_CODES.VALIDATION_ERROR,
                category: ERROR_CATEGORIES.VALIDATION
              },
              args,
              data: {
                type: 'zero',
                help: false,
                version: false
              } as ZeroParamResult
            };
          }
          // Empty value is allowed for custom variables
          continue;
        }

        if (!this.isValidOption(key)) {
          return {
            success: false,
            error: {
              message: `Unknown option: ${key}`,
              code: ERROR_CODES.VALIDATION_ERROR,
              category: ERROR_CATEGORIES.VALIDATION
            },
            args,
            data: {
              type: 'zero',
              help: false,
              version: false
            } as ZeroParamResult
          };
        }

        if (!value) {
          return {
            success: false,
            error: {
              ...ErrorFactory.createMissingOptionValue(key),
              code: ERROR_CODES.VALIDATION_ERROR,
              category: ERROR_CATEGORIES.VALIDATION
            },
            args,
            data: {
              type: 'zero',
              help: false,
              version: false
            } as ZeroParamResult
          };
        }
      } else if (arg.startsWith('-')) {
        if (arg === '-h' || arg === '-v') {
          continue;
        }
        const key = arg.slice(1);
        if (!this.isValidOption(key)) {
          return {
            success: false,
            error: {
              message: `Unknown option: -${key}`,
              code: ERROR_CODES.VALIDATION_ERROR,
              category: ERROR_CATEGORIES.VALIDATION
            },
            args,
            data: {
              type: 'zero',
              help: false,
              version: false
            } as ZeroParamResult
          };
        }
        if (i + 1 >= args.length) {
          return {
            success: false,
            error: {
              ...ErrorFactory.createMissingOptionValue(key),
              code: ERROR_CODES.VALIDATION_ERROR,
              category: ERROR_CATEGORIES.VALIDATION
            },
            args,
            data: {
              type: 'zero',
              help: false,
              version: false
            } as ZeroParamResult
          };
        }
        i++; // Skip the value
      }
    }

    return {
      success: true,
      data: {
        type: 'zero',
        help,
        version
      },
      args
    };
  }

  /**
   * Determines if this validator can handle the given arguments
   * @param args The arguments to check
   * @returns True if this validator can handle the arguments
   */
  canHandle(args: string[]): boolean {
    return args.filter(arg => !arg.startsWith('-')).length === 0;
  }

  /**
   * Checks if an option is valid
   * @param key The option key to check
   * @returns True if the option is valid, false otherwise
   */
  private isValidOption(key: string): boolean {
    const validOptions = ['--from', '--destination', '--uv-', 'f', 'o'];
    return validOptions.some(option => key.startsWith(option));
  }
} 