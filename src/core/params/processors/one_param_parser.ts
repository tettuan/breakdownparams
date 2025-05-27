import { ErrorInfo, OneParamResult, ParseResult } from '../definitions/types.ts';
import { BaseValidator } from '../../errors/validators/base_validator.ts';
import { ERROR_CATEGORIES, ERROR_CODES } from '../../errors/constants.ts';
import { SecurityErrorValidator } from '../../errors/validators/security_error_validator.ts';
import { ErrorCategory, ErrorCode } from '../../errors/types.ts';
import { BreakdownLogger } from '@tettuan/breakdownlogger';

const logger = new BreakdownLogger();

const VALID_COMMANDS = new Set(['init']);
const VALID_OPTIONS = new Set(['from', 'destination', 'uv-']);

/**
 * Parser for commands with one parameter
 */
export class OneParamParser extends BaseValidator {
  private readonly securityValidator: SecurityErrorValidator;

  constructor(errorCode: string, errorCategory: string) {
    super(errorCode as ErrorCode, errorCategory as ErrorCategory);
    this.securityValidator = new SecurityErrorValidator();
  }

  /**
   * Validates arguments for a command with one parameter
   * @param args The arguments to validate
   * @returns The validation result
   */
  validate(args: string[]): ParseResult<OneParamResult> {
    const nonOptionArgs = args.filter((arg) => !arg.startsWith('-'));
    const optionArgs = args.filter((arg) => arg.startsWith('-'));
    if (nonOptionArgs.length === 0) {
      return this.createErrorResult('Command parameter is required') as ParseResult<OneParamResult>;
    }
    if (nonOptionArgs.length > 1) {
      return this.createErrorResult('Only one command parameter is allowed') as ParseResult<
        OneParamResult
      >;
    }

    // Validate command
    const command = nonOptionArgs[0];
    if (!VALID_COMMANDS.has(command.trim().toLowerCase())) {
      return this.createErrorResult(`Invalid command: ${command}`) as ParseResult<OneParamResult>;
    }

    // Security check for command
    const securityErrorCmd = this.securityValidator.validate(nonOptionArgs);
    if (!securityErrorCmd.success) {
      logger.debug('Security check for command failed:', { securityErrorCmd });
      return this.createErrorResult(securityErrorCmd.error?.message ?? 'Security error', {
        code: ERROR_CODES.SECURITY_ERROR,
        category: ERROR_CATEGORIES.SECURITY,
      }) as ParseResult<OneParamResult>;
    }

    // Security check for options
    const securityErrorOpt = this.securityValidator.validate(optionArgs);
    if (!securityErrorOpt.success) {
      logger.debug('Security check for options failed:', { securityErrorOpt });
      return this.createErrorResult(securityErrorOpt.error?.message ?? 'Security error', {
        code: ERROR_CODES.SECURITY_ERROR,
        category: ERROR_CATEGORIES.SECURITY,
      }) as ParseResult<OneParamResult>;
    }

    // Parse options
    const optionsResult = this.parseOptions(optionArgs);
    if (optionsResult.error) {
      logger.debug('Parse options failed:', { optionsResult });
      return this.createErrorResult(optionsResult.error.message, {
        code: ERROR_CODES.VALIDATION_ERROR,
        category: ERROR_CATEGORIES.VALIDATION,
      }) as ParseResult<OneParamResult>;
    }

    return {
      success: true,
      data: {
        type: 'one',
        command: command.trim().toLowerCase(),
        options: optionsResult.options,
      },
    };
  }

  /**
   * Determines if this parser can handle the given arguments
   * @param args The arguments to check
   * @returns True if this parser can handle the arguments
   */
  canHandle(args: string[]): boolean {
    return args.filter((arg) => !arg.startsWith('-')).length === 1;
  }

  /**
   * Parses options from command arguments
   * @param args The arguments to parse
   * @returns The parsed options or an error
   */
  private parseOptions(args: string[]): { options: Record<string, string>; error?: ErrorInfo } {
    logger.debug('Starting parseOptions:', { args });
    const options: Record<string, string> = {};
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      logger.debug('Processing argument:', { arg, index: i });

      // セキュリティチェック（オプション名・値）
      const secOpt = this.securityValidator.validate([arg]);
      if (!secOpt.success) {
        logger.debug('Security check for option failed:', { arg, secOpt });
        return {
          options: {},
          error: {
            message: secOpt.error?.message ?? 'Security error',
            code: ERROR_CODES.VALIDATION_ERROR,
            category: ERROR_CATEGORIES.VALIDATION,
          },
        };
      }

      if (arg.startsWith('--')) {
        if (arg === '--help' || arg === '--version') {
          logger.debug('Skipping help/version flag:', { arg });
          continue;
        }

        // スペース区切りのオプションは無効な形式
        if (arg.includes(' ') && !arg.includes('=')) {
          logger.debug('Space-separated option detected:', { arg });
          return {
            options: {},
            error: {
              message: `Invalid option format: ${arg}`,
              code: ERROR_CODES.VALIDATION_ERROR,
              category: ERROR_CATEGORIES.VALIDATION,
            },
          };
        }

        // --from=src, --destination=dist
        if (arg.startsWith('--from=')) {
          const value = arg.substring(7);
          const secVal = this.securityValidator.validate([value]);
          if (!secVal.success) {
            logger.debug('Security check for from value failed:', { value, secVal });
            return {
              options: {},
              error: {
                message: secVal.error?.message ?? 'Security error',
                code: ERROR_CODES.VALIDATION_ERROR,
                category: ERROR_CATEGORIES.VALIDATION,
              },
            };
          }
          options['fromFile'] = value;
          continue;
        } else if (arg.startsWith('--destination=')) {
          const value = arg.substring(14);
          const secVal = this.securityValidator.validate([value]);
          if (!secVal.success) {
            logger.debug('Security check for destination value failed:', { value, secVal });
            return {
              options: {},
              error: {
                message: secVal.error?.message ?? 'Security error',
                code: ERROR_CODES.VALIDATION_ERROR,
                category: ERROR_CATEGORIES.VALIDATION,
              },
            };
          }
          options['destinationFile'] = value;
          continue;
        } else if (arg.startsWith('--uv-')) {
          const eqIdx = arg.indexOf('=');
          if (eqIdx === -1) {
            logger.debug('Invalid custom variable format (missing =):', { arg });
            return {
              options: {},
              error: {
                message: `Invalid option format: ${arg}`,
                code: ERROR_CODES.VALIDATION_ERROR,
                category: ERROR_CATEGORIES.VALIDATION,
              },
            };
          }
          const key = arg.slice(2, eqIdx);
          const value = arg.slice(eqIdx + 1);
          const secVal = this.securityValidator.validate([value]);
          if (!secVal.success) {
            logger.debug('Security check for custom variable value failed:', {
              key,
              value,
              secVal,
            });
            return {
              options: {},
              error: {
                message: secVal.error?.message ?? 'Security error',
                code: ERROR_CODES.VALIDATION_ERROR,
                category: ERROR_CATEGORIES.VALIDATION,
              },
            };
          }
          options[key] = value;
          continue;
        } else if (!this.isValidOption(arg.slice(2))) {
          logger.debug('Unknown option:', { arg });
          return {
            options: {},
            error: {
              message: `Unknown option: ${arg}`,
              code: ERROR_CODES.VALIDATION_ERROR,
              category: ERROR_CATEGORIES.VALIDATION,
            },
          };
        }
      } else if (arg.startsWith('-')) {
        if (arg === '-h' || arg === '-v') {
          continue;
        }
        // -f=src, -o=dist
        if (arg.startsWith('-f=')) {
          const value = arg.substring(3);
          const secVal = this.securityValidator.validate([value]);
          if (!secVal.success) {
            logger.debug('Security check for -f value failed:', { value, secVal });
            return {
              options: {},
              error: {
                message: secVal.error?.message ?? 'Security error',
                code: ERROR_CODES.VALIDATION_ERROR,
                category: ERROR_CATEGORIES.VALIDATION,
              },
            };
          }
          options['fromFile'] = value;
          continue;
        } else if (arg.startsWith('-o=')) {
          const value = arg.substring(3);
          const secVal = this.securityValidator.validate([value]);
          if (!secVal.success) {
            logger.debug('Security check for -o value failed:', { value, secVal });
            return {
              options: {},
              error: {
                message: secVal.error?.message ?? 'Security error',
                code: ERROR_CODES.VALIDATION_ERROR,
                category: ERROR_CATEGORIES.VALIDATION,
              },
            };
          }
          options['destinationFile'] = value;
          continue;
        } else if (!this.isValidOption(arg.slice(1))) {
          logger.debug('Unknown short option:', { arg });
          return {
            options: {},
            error: {
              message: `Unknown option: ${arg}`,
              code: ERROR_CODES.VALIDATION_ERROR,
              category: ERROR_CATEGORIES.VALIDATION,
            },
          };
        }
      }
    }
    return { options };
  }

  /**
   * Checks if an option is valid
   * @param key The option key to check
   * @returns True if the option is valid, false otherwise
   */
  private isValidOption(key: string): boolean {
    const isValid = Array.from(VALID_OPTIONS).some((option) => key.startsWith(option));
    logger.debug('Option validation:', { key, isValid, validOptions: Array.from(VALID_OPTIONS) });
    return isValid;
  }
}
