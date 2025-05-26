import { TwoParamResult, OptionParams, ParseResult, ParamPatternResult } from '../core/params/definitions/types.ts';
import { ErrorCategory, ErrorCode, ErrorInfo } from '../core/errors/types.ts';
import { SecurityErrorValidator } from '../core/errors/validators/security_error_validator.ts';
import { BaseValidator } from '../core/errors/validators/base_validator.ts';
import { ErrorFactory } from '../core/errors/error_factory.ts';
import { ValidatorFactory } from './validator_factory.ts';
import { ERROR_CODES, ERROR_CATEGORIES } from '../core/errors/constants.ts';

/**
 * TwoParamValidator
 * Validates two parameter commands
 */
export class TwoParamValidator extends BaseValidator {
  private readonly securityValidator: SecurityErrorValidator;
  private readonly validDemonstrativeTypes: Set<string>;
  private readonly validLayerTypes: Set<string>;

  constructor() {
    super(ERROR_CODES.VALIDATION_ERROR, ERROR_CATEGORIES.VALIDATION);
    const validatorFactory = ValidatorFactory.getInstance();
    this.securityValidator = validatorFactory.createSecurityValidator();
    this.validDemonstrativeTypes = new Set(['to', 'summary', 'defect']);
    this.validLayerTypes = new Set(['project', 'issue', 'task']);
  }

  /**
   * Validates the given arguments and returns a parse result.
   * @param args - The command line arguments to validate
   * @returns A parse result containing either the validated parameters or an error
   */
  public validate(args: string[]): ParseResult<ParamPatternResult> {
    // Split arguments into command and options
    const [demonstrativeType, layerType, ...options] = args;

    // Check if demonstrative type is valid
    if (!demonstrativeType || typeof demonstrativeType !== 'string') {
      return this.createErrorResult('Demonstrative type must be a string');
    }

    const demonstrativeTypeLower = demonstrativeType.toLowerCase();

    // Check for security issues
    const securityError = this.securityValidator.validate([demonstrativeTypeLower]);
    if (securityError && !securityError.success) {
      return {
        success: false,
        error: {
          message: securityError.error!.message,
          code: ERROR_CODES.SECURITY_ERROR,
          category: ERROR_CATEGORIES.SECURITY
        },
        data: {
          type: 'two',
          demonstrativeType: demonstrativeTypeLower,
          layerType: layerType || '',
          options: {}
        }
      };
    }

    // Check if demonstrative type is valid
    if (!this.validDemonstrativeTypes.has(demonstrativeTypeLower)) {
      return {
        success: false,
        error: {
          message: `Invalid demonstrative type: ${demonstrativeTypeLower}`,
          code: ERROR_CODES.VALIDATION_ERROR,
          category: ERROR_CATEGORIES.VALIDATION
        },
        data: {
          type: 'two',
          demonstrativeType: demonstrativeTypeLower,
          layerType: layerType || '',
          options: {}
        }
      };
    }

    // Check if layer type is valid
    if (!layerType || typeof layerType !== 'string') {
      return this.createErrorResult('Layer type must be a string');
    }

    // Check for security issues in layer type
    const layerTypeSecurityError = this.securityValidator.validate([layerType]);
    if (layerTypeSecurityError && !layerTypeSecurityError.success) {
      return {
        success: false,
        error: {
          message: layerTypeSecurityError.error!.message,
          code: ERROR_CODES.SECURITY_ERROR,
          category: ERROR_CATEGORIES.SECURITY
        },
        data: {
          type: 'two',
          demonstrativeType: demonstrativeTypeLower,
          layerType,
          options: {}
        }
      };
    }

    // Check if layer type is valid
    if (!this.validLayerTypes.has(layerType)) {
      return {
        success: false,
        error: {
          message: `Invalid layer type: ${layerType}`,
          code: ERROR_CODES.VALIDATION_ERROR,
          category: ERROR_CATEGORIES.VALIDATION
        },
        data: {
          type: 'two',
          demonstrativeType: demonstrativeTypeLower,
          layerType,
          options: {}
        }
      };
    }

    // Parse options
    const optionsResult = this.parseOptions(options);
    if (optionsResult.error) {
      return {
        success: false,
        error: {
          message: optionsResult.error.message,
          code: optionsResult.error.code,
          category: optionsResult.error.category
        },
        data: {
          type: 'two',
          demonstrativeType: demonstrativeTypeLower,
          layerType,
          options: {}
        }
      };
    }

    // Return success
    return this.createSuccessResult({
      type: 'two',
      demonstrativeType: demonstrativeTypeLower,
      layerType,
      options: optionsResult.options
    });
  }

  /**
   * Determines if this validator can handle the given arguments.
   * @param args - The command line arguments to check
   * @returns True if this validator can handle the arguments, false otherwise
   */
  public canHandle(args: string[]): boolean {
    return args.length > 1 && !args[0].startsWith('-') && !args[1].startsWith('-');
  }

  /**
   * Parses options from command arguments
   * @param args - The command arguments to parse
   * @returns The parsed options or an error
   */
  private parseOptions(args: string[]): { options: Record<string, string | boolean>; error?: ErrorInfo } {
    const options: Record<string, string | boolean> = {};
    let i = 0;

    while (i < args.length) {
      const arg = args[i];

      if (!arg.startsWith('-')) {
        i++;
        continue;
      }

      if (arg === '--help') {
        options['help'] = true;
        i++;
      } else if (arg === '--version') {
        options['version'] = true;
        i++;
      } else if (arg.startsWith('--uv-')) {
        const [name, value] = arg.split('=');
        if (!/^[a-zA-Z0-9_-]+$/.test(name.slice(5))) {
          return {
            options: {},
            error: {
              message: `Invalid custom variable name: ${name}`,
              code: ERROR_CODES.INVALID_CUSTOM_VARIABLE,
              category: ERROR_CATEGORIES.VALIDATION
            }
          };
        }
        if (!value) {
          if (i + 1 >= args.length) {
            return {
              options: {},
              error: {
                message: `Missing value for custom variable: ${name}`,
                code: ERROR_CODES.MISSING_OPTION_VALUE,
                category: ERROR_CATEGORIES.VALIDATION
              }
            };
          }
          options[name] = args[++i];
        } else {
          options[name] = value;
          i++;
        }
      } else if (arg.startsWith('--from=') || arg.startsWith('-f=')) {
        const [key, value] = arg.split('=');
        if (!value) {
          return {
            options: {},
            error: {
              message: `Missing value for option: ${arg}`,
              code: ERROR_CODES.MISSING_OPTION_VALUE,
              category: ERROR_CATEGORIES.VALIDATION
            }
          };
        }
        options['fromFile'] = value;
        i++;
      } else if (arg.startsWith('--destination=') || arg.startsWith('-o=')) {
        const [key, value] = arg.split('=');
        if (!value) {
          return {
            options: {},
            error: {
              message: `Missing value for option: ${arg}`,
              code: ERROR_CODES.MISSING_OPTION_VALUE,
              category: ERROR_CATEGORIES.VALIDATION
            }
          };
        }
        options['destinationFile'] = value;
        i++;
      } else if (arg.startsWith('--input=') || arg.startsWith('-i=')) {
        const [key, value] = arg.split('=');
        if (!value) {
          return {
            options: {},
            error: {
              message: `Missing value for option: ${arg}`,
              code: ERROR_CODES.MISSING_OPTION_VALUE,
              category: ERROR_CATEGORIES.VALIDATION
            }
          };
        }
        options['fromLayerType'] = value;
        i++;
      } else if (arg.startsWith('--adaptation=') || arg.startsWith('-a=')) {
        const [key, value] = arg.split('=');
        if (!value) {
          return {
            options: {},
            error: {
              message: `Missing value for option: ${arg}`,
              code: ERROR_CODES.MISSING_OPTION_VALUE,
              category: ERROR_CATEGORIES.VALIDATION
            }
          };
        }
        options['adaptationType'] = value;
        i++;
      } else if (arg === '--from' || arg === '-f') {
        return {
          options: {},
          error: {
            message: `Invalid option format: ${arg}. Use ${arg}=value instead.`,
            code: ERROR_CODES.INVALID_OPTION,
            category: ERROR_CATEGORIES.VALIDATION
          }
        };
      } else if (arg === '--destination' || arg === '-o') {
        return {
          options: {},
          error: {
            message: `Invalid option format: ${arg}. Use ${arg}=value instead.`,
            code: ERROR_CODES.INVALID_OPTION,
            category: ERROR_CATEGORIES.VALIDATION
          }
        };
      } else if (arg === '--input' || arg === '-i') {
        return {
          options: {},
          error: {
            message: `Invalid option format: ${arg}. Use ${arg}=value instead.`,
            code: ERROR_CODES.INVALID_OPTION,
            category: ERROR_CATEGORIES.VALIDATION
          }
        };
      } else if (arg === '--adaptation' || arg === '-a') {
        return {
          options: {},
          error: {
            message: `Invalid option format: ${arg}. Use ${arg}=value instead.`,
            code: ERROR_CODES.INVALID_OPTION,
            category: ERROR_CATEGORIES.VALIDATION
          }
        };
      } else {
        return {
          options: {},
          error: {
            message: `Unknown option: ${arg}`,
            code: ERROR_CODES.UNKNOWN_OPTION,
            category: ERROR_CATEGORIES.VALIDATION
          }
        };
      }
    }

    return { options };
  }
} 