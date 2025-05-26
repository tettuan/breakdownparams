import {
  DemonstrativeType,
  DoubleParamsResult,
  ErrorInfo,
  LayerType,
  LayerTypeAliasMap,
  NoParamsResult,
  OptionParams,
  ParamsResult,
  ParserConfig,
  SingleParamResult,
} from './types.ts';
import {
  ZeroParamsValidator,
  OneParamsValidator,
  TwoParamsValidator,
} from './validators.ts';

/**
 * A class to parse and validate command line arguments for the breakdown structure system.
 *
 * This class provides functionality to parse command line arguments with type safety and validation,
 * supporting various command patterns and options for managing breakdown structures.
 *
 * The parser supports three main types of parameter combinations:
 * 1. No parameters (with optional help/version flags)
 * 2. Single parameter (e.g., 'init' command)
 * 3. Double parameters (demonstrative type + layer type)
 *
 * @example
 * ```ts
 * const parser = new ParamsParser();
 * const result = parser.parse(Deno.args);
 *
 * if (result.type === "no-params") {
 *   // Handle no parameters case
 *   if (result.help) {
 *     // Show help message
 *   }
 * } else if (result.type === "single") {
 *   // Handle single parameter case
 *   if (result.command === "init") {
 *     // Handle init command
 *   }
 * } else if (result.type === "double") {
 *   // Handle double parameters case
 *   const { demonstrativeType, layerType, options } = result;
 *   // Process the parameters
 * }
 * ```
 *
 * @since 1.0.0
 * @module
 */
export class ParamsParser {
  private readonly config: ParserConfig;
  private readonly zeroValidator: ZeroParamsValidator;
  private readonly oneValidator: OneParamsValidator;
  private readonly twoValidator: TwoParamsValidator;

  /**
   * Create a new ParamsParser instance with optional configuration.
   *
   * The configuration allows for extended mode validation and custom validation rules
   * for demonstrative types and layer types.
   *
   * @param config - Optional configuration for extended mode validation and custom rules
   * @throws {Error} If the configuration is invalid
   * @since 1.0.0
   */
  constructor(config?: ParserConfig) {
    this.config = config || { isExtendedMode: false };
    this.zeroValidator = new ZeroParamsValidator(this.config);
    this.oneValidator = new OneParamsValidator(this.config);
    this.twoValidator = new TwoParamsValidator(this.config);
  }

  /**
   * Parse command line arguments and return a type-safe result.
   *
   * This method analyzes the provided arguments and returns a result object that
   * indicates the type of command and any associated options or errors.
   *
   * @param args - Array of command line arguments to parse
   * @returns A {@link ParamsResult} object containing the parsed parameters and any errors
   * @throws {Error} If the arguments cannot be parsed
   * @since 1.0.0
   */
  public parse(args: string[]): ParamsResult {
    try {
      const nonOptionArgs: string[] = [];
      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (!arg.startsWith('-') && arg !== '') {
          nonOptionArgs.push(arg);
        } else {
          const nextArg = args[i + 1];
          if (nextArg && !nextArg.startsWith('-')) {
            i++;
          }
        }
      }

      if (nonOptionArgs.length === 0) {
        return this.handleZeroParams(args);
      } else if (nonOptionArgs.length === 1) {
        return this.handleOneParam(nonOptionArgs[0], args);
      } else if (nonOptionArgs.length === 2) {
        return this.handleTwoParams(nonOptionArgs[0], nonOptionArgs[1], args);
      } else {
        // Too many arguments
        return {
          type: 'no-params',
          help: false,
          version: false,
          error: {
            message: 'Too many arguments. Maximum 2 arguments are allowed.',
            code: 'TOO_MANY_ARGUMENTS',
            category: 'SYNTAX',
            details: { provided: nonOptionArgs.length, maxAllowed: 2 },
          },
        };
      }
    } catch (error) {
      return {
        type: 'no-params',
        help: false,
        version: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 'UNEXPECTED_ERROR',
          category: 'UNEXPECTED',
          details: error instanceof Error ? { stack: error.stack } : undefined,
        },
      };
    }
  }

  /**
   * Handle zero parameters using validator pattern.
   *
   * @param args - The command line arguments
   * @returns A result object containing help and version flags
   */
  private handleZeroParams(args: string[]): NoParamsResult {
    const validationResult = this.zeroValidator.validate(args);
    
    // Parse options to check for errors, but ignore custom variables in zero params
    const options = this.parseOptions(args);
    if ('error' in options) {
      return {
        ...validationResult,
        error: options.error,
      };
    }
    
    return validationResult;
  }

  /**
   * Handle single parameter using validator pattern.
   *
   * @param command - The command parameter
   * @param args - The command line arguments
   * @returns A result object containing the parsed command
   */
  private handleOneParam(
    command: string,
    args: string[],
  ): SingleParamResult {
    const validationResult = this.oneValidator.validate(args, command);
    
    // Parse options to check for errors
    const options = this.parseOptions(args);
    if ('error' in options) {
      return {
        ...validationResult,
        error: options.error,
      };
    }
    
    // Ignore config and custom variables for single param
    const { configFile: _configFile, customVariables: _customVariables, ...validOptions } = options;
    
    return {
      ...validationResult,
      options: validOptions,
    };
  }

  /**
   * Handle two parameters using validator pattern.
   *
   * @param demonstrativeType - The demonstrative type parameter
   * @param layerType - The layer type parameter
   * @param args - The command line arguments
   * @returns A result object containing the parsed parameters or an error
   */
  private handleTwoParams(
    demonstrativeType: string,
    layerType: string,
    args: string[],
  ): DoubleParamsResult {
    const validationResult = this.twoValidator.validate(args, demonstrativeType, layerType);
    
    // If validation failed, return the error result
    if (validationResult.error) {
      return validationResult;
    }
    
    // Parse options to check for errors and add to result
    const options = this.parseOptions(args);
    if ('error' in options) {
      return {
        ...validationResult,
        error: options.error,
      };
    }
    
    return {
      ...validationResult,
      options: options as OptionParams,
    };
  }

  /**
   * Parse command line options.
   *
   * This method parses the command line options and returns an object
   * containing the parsed options or an error message.
   *
   * @param args - The command line arguments
   * @returns An object containing the parsed options or an error message
   */
  private parseOptions(args: string[]): OptionParams | { error: ErrorInfo } {
    const options: OptionParams = {};
    const customVariables: Record<string, string> = {};
    // Track long form values only (short form with values not supported)
    const longForm: Record<string, string | undefined> = {};

    // 最大値の制限
    const MAX_VALUE_LENGTH = 1000;
    const MAX_CUSTOM_VARIABLES = 100;

    // 禁止文字リスト
    const forbiddenChars = [
      ';',
      '|',
      '&',
      '`',
      '$',
      '>',
      '<',
      '(',
      ')',
      '{',
      '}',
      '[',
      ']',
      '\\',
      '/',
      '*',
      '?',
      '+',
      '^',
      '~',
      '!',
      '@',
      '#',
      '%',
      '=',
      ':',
      '"',
      "'",
      ',',
    ];

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith('--')) {
        if (arg === '--help' || arg === '--version') {
          continue;
        }
        // Handle custom variable options (--uv-*)
        if (arg.startsWith('--uv-')) {
          // deno-lint-ignore no-control-regex
          const hasControlCharInName = /[\x00-\x1F\x7F]/.test(arg);
          if (hasControlCharInName) {
            return {
              error: {
                message: 'Security error: control characters are not allowed in parameters',
                code: 'VALIDATION_ERROR',
                category: 'VALIDATION',
                details: { location: 'customVariableName' },
              },
            };
          }

          // --uv-name=value 形式
          if (arg.includes('=')) {
            const [name, value] = arg.slice(5).split('=');
            if (!name) {
              return {
                error: {
                  message: `Invalid custom variable name: ${arg}`,
                  code: 'INVALID_CUSTOM_VARIABLE_NAME',
                  category: 'VALIDATION',
                  details: { provided: arg },
                },
              };
            }

            // 特殊文字を含むカスタム変数名のチェック
            const hasSpecialChar = /[^a-zA-Z0-9_]/.test(name);
            if (hasSpecialChar) {
              return {
                error: {
                  message:
                    `Invalid custom variable name: ${name}. Only alphanumeric characters and underscores are allowed.`,
                  code: 'INVALID_CUSTOM_VARIABLE_NAME',
                  category: 'VALIDATION',
                  details: { provided: name },
                },
              };
            }

            if (value === undefined) {
              return {
                error: {
                  message: `Missing value for custom variable: ${arg}`,
                  code: 'MISSING_VALUE_FOR_CUSTOM_VARIABLE',
                  category: 'SYNTAX',
                  details: { variable: arg },
                },
              };
            }

            // 値の長さチェック
            if (value.length > MAX_VALUE_LENGTH) {
              return {
                error: {
                  message:
                    `Value too long for custom variable: ${name}. Maximum length is ${MAX_VALUE_LENGTH} characters.`,
                  code: 'VALUE_TOO_LONG',
                  category: 'VALIDATION',
                  details: { variable: name, maxLength: MAX_VALUE_LENGTH },
                },
              };
            }

            // deno-lint-ignore no-control-regex
            const hasControlCharInValue = /[\x00-\x1F\x7F]/.test(value);
            if (hasControlCharInValue) {
              return {
                error: {
                  message: 'Security error: control characters are not allowed in parameters',
                  code: 'SECURITY_ERROR',
                  category: 'SECURITY',
                  details: { location: `customVariableValue:${name}` },
                },
              };
            }

            for (const c of forbiddenChars) {
              if (value.includes(c)) {
                return {
                  error: {
                    message: `Security error: character '${c}' is not allowed in parameters`,
                    code: 'VALIDATION_ERROR',
                    category: 'VALIDATION',
                    details: { forbiddenChar: c, location: `customVariableValue:${name}` },
                  },
                };
              }
            }

            // カスタム変数の最大数チェック
            if (Object.keys(customVariables).length >= MAX_CUSTOM_VARIABLES) {
              return {
                error: {
                  message:
                    `Too many custom variables. Maximum ${MAX_CUSTOM_VARIABLES} variables are allowed.`,
                  code: 'TOO_MANY_CUSTOM_VARIABLES',
                  category: 'VALIDATION',
                  details: { maxAllowed: MAX_CUSTOM_VARIABLES },
                },
              };
            }

            customVariables[name] = value;
            continue;
          }

          // --uv-name value 形式
          const name = arg.slice(5);
          if (!name) {
            return {
              error: {
                message: `Invalid custom variable name: ${arg}`,
                code: 'INVALID_CUSTOM_VARIABLE_NAME',
                category: 'VALIDATION',
                details: { provided: arg },
              },
            };
          }

          // 特殊文字を含むカスタム変数名のチェック
          const hasSpecialChar = /[^a-zA-Z0-9_]/.test(name);
          if (hasSpecialChar) {
            return {
              error: {
                message:
                  `Invalid custom variable name: ${name}. Only alphanumeric characters and underscores are allowed.`,
                code: 'INVALID_CUSTOM_VARIABLE_NAME',
                category: 'VALIDATION',
                details: { provided: name },
              },
            };
          }

          const nextArg = args[i + 1];
          if (!nextArg || nextArg.startsWith('-')) {
            return {
              error: {
                message: `Missing value for custom variable: ${arg}`,
                code: 'MISSING_VALUE_FOR_CUSTOM_VARIABLE',
                category: 'SYNTAX',
                details: { variable: arg },
              },
            };
          }

          // 値の長さチェック
          if (nextArg.length > MAX_VALUE_LENGTH) {
            return {
              error: {
                message:
                  `Value too long for custom variable: ${name}. Maximum length is ${MAX_VALUE_LENGTH} characters.`,
                code: 'VALUE_TOO_LONG',
                category: 'VALIDATION',
                details: { variable: name, maxLength: MAX_VALUE_LENGTH },
              },
            };
          }

          // deno-lint-ignore no-control-regex
          const hasControlCharInNextArg = /[\x00-\x1F\x7F]/.test(nextArg);
          if (hasControlCharInNextArg) {
            return {
              error: {
                message: 'Security error: control characters are not allowed in parameters',
                code: 'VALIDATION_ERROR',
                category: 'VALIDATION',
                details: { location: `customVariableValue:${name}` },
              },
            };
          }

          for (const c of forbiddenChars) {
            if (nextArg.includes(c)) {
              return {
                error: {
                  message: `Security error: character '${c}' is not allowed in parameters`,
                  code: 'VALIDATION_ERROR',
                  category: 'VALIDATION',
                  details: { forbiddenChar: c, location: `customVariableValue:${name}` },
                },
              };
            }
          }

          // カスタム変数の最大数チェック
          if (Object.keys(customVariables).length >= MAX_CUSTOM_VARIABLES) {
            return {
              error: {
                message:
                  `Too many custom variables. Maximum ${MAX_CUSTOM_VARIABLES} variables are allowed.`,
                code: 'TOO_MANY_CUSTOM_VARIABLES',
                category: 'VALIDATION',
                details: { maxAllowed: MAX_CUSTOM_VARIABLES },
              },
            };
          }

          customVariables[name] = nextArg;
          i++;
          continue;
        }
        // Handle --option=value for standard options
        if (arg.includes('=') && !arg.startsWith('--uv-')) {
          const [opt, value] = arg.split('=');
          switch (opt) {
            case '--from':
              longForm.fromFile = value;
              break;
            case '--destination':
              longForm.destinationFile = value;
              break;
            case '--input':
              if (!this.layerTypes.has(value as LayerType)) {
                return {
                  error: {
                    message: `Invalid layer type: ${value}`,
                    code: 'VALIDATION_ERROR',
                    category: 'VALIDATION',
                    details: { provided: value, validTypes: Array.from(this.layerTypes) },
                  },
                };
              }
              longForm.fromLayerType = value;
              break;
            case '--adaptation':
              longForm.adaptationType = value;
              break;
            case '--config':
              longForm.configFile = value;
              break;
            default:
              return {
                error: {
                  message: `Unknown option: ${opt}`,
                  code: 'VALIDATION_ERROR',
                  category: 'VALIDATION',
                  details: { provided: opt },
                },
              };
          }
          continue;
        }
        // Space-separated options are not allowed - must use = syntax
        return {
          error: {
            message: `Invalid option format: ${arg}. Use ${arg}=value instead of space-separated format.`,
            code: 'INVALID_OPTION',
            category: 'SYNTAX',
            details: { option: arg, suggestion: `${arg}=value` },
          },
        };
      } else if (arg.startsWith('-')) {
        if (arg === '-h' || arg === '-v') {
          continue;
        }
        // Space-separated short options are not allowed
        return {
          error: {
            message: `Invalid option format: ${arg}. Short options with values are not supported in this implementation.`,
            code: 'INVALID_OPTION',
            category: 'SYNTAX',
            details: { option: arg, suggestion: `Use long form with = syntax instead` },
          },
        };
      }
    }
    // Assign options from long form only (short form with values not supported)
    options.fromFile = longForm.fromFile;
    options.destinationFile = longForm.destinationFile;
    options.fromLayerType = longForm.fromLayerType as LayerType | undefined;
    options.adaptationType = longForm.adaptationType;
    options.configFile = longForm.configFile;
    // Add custom variables to options if any were found
    if (Object.keys(customVariables).length > 0) {
      options.customVariables = customVariables;
    }
    // Remove undefined properties
    Object.keys(options).forEach((key) => {
      if (options[key as keyof OptionParams] === undefined) {
        delete options[key as keyof OptionParams];
      }
    });
    return options;
  }
}
