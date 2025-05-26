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
  private readonly demonstrativeTypes = new Set<DemonstrativeType>([
    'to',
    'summary',
    'defect',
  ]);
  private readonly validSingleCommands = new Set<string>(['init']);
  private readonly config: ParserConfig;
  private readonly layerTypes = new Set<LayerType>(['project', 'issue', 'task']);
  private readonly layerTypeAliases = new Set<string>(Object.keys(LayerTypeAliasMap));

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
        return this.parseNoParams(args);
      } else if (nonOptionArgs.length === 1) {
        return this.parseSingleParam(nonOptionArgs[0], args);
      } else if (nonOptionArgs.length === 2) {
        return this.parseDoubleParams(nonOptionArgs[0], nonOptionArgs[1], args);
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
   * Parse arguments when no parameters are expected.
   *
   * @param args - The command line arguments
   * @returns A result object containing help and version flags
   */
  private parseNoParams(args: string[]): NoParamsResult {
    const result: NoParamsResult = {
      type: 'no-params',
      help: false,
      version: false,
    };
    const options = this.parseOptions(args);
    if ('error' in options) {
      result.error = options.error;
      return result;
    }
    if ('customVariables' in options) {
      delete options.customVariables;
    }
    for (const arg of args) {
      if (arg === '--help' || arg === '-h') result.help = true;
      if (arg === '--version' || arg === '-v') result.version = true;
    }
    return result;
  }

  /**
   * Parse arguments when a single parameter is expected.
   *
   * @param command - The command parameter
   * @param args - The command line arguments
   * @returns A result object containing the parsed command
   */
  private parseSingleParam(
    command: string,
    args: string[],
  ): SingleParamResult {
    const options = this.parseOptions(args);
    if ('error' in options) {
      return {
        type: 'single',
        command: 'init',
        options: {},
        error: options.error,
      };
    }
    // configオプションを無視
    const { configFile: _configFile, ...validOptions } = options;
    if ('customVariables' in validOptions) {
      delete validOptions.customVariables;
    }
    if (!this.validSingleCommands.has(command)) {
      return {
        type: 'single',
        command: 'init',
        options: {},
        error: {
          message: `Invalid command: ${command}. Must be one of: ${
            Array.from(this.validSingleCommands).join(', ')
          }`,
          code: 'INVALID_COMMAND',
          category: 'VALIDATION',
          details: { provided: command, validCommands: Array.from(this.validSingleCommands) },
        },
      };
    }
    return {
      type: 'single',
      command: 'init',
      options: validOptions,
    };
  }

  /**
   * Parse arguments when two parameters are expected.
   *
   * @param demonstrativeType - The demonstrative type parameter
   * @param layerType - The layer type parameter
   * @param args - The command line arguments
   * @returns A result object containing the parsed parameters or an error
   */
  private parseDoubleParams(
    demonstrativeType: string,
    layerType: string,
    args: string[],
  ): DoubleParamsResult {
    const normalizedDemonstrativeType = demonstrativeType.toLowerCase();
    let normalizedLayerType = layerType.toLowerCase();
    if (this.layerTypeAliases.has(normalizedLayerType)) {
      // LayerTypeAliasMapから正式名称に変換
      // LayerTypeAliasMapはtypes.tsで定義
      // @ts-ignore: LayerTypeAliasMapの型定義は正しいが、TypeScriptが動的なプロパティアクセスを検出できない
      normalizedLayerType = LayerTypeAliasMap[normalizedLayerType];
    }
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
    for (const c of forbiddenChars) {
      if (demonstrativeType.includes(c) || layerType.includes(c)) {
        return {
          type: 'double',
          demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
          layerType: normalizedLayerType as LayerType,
          options: {},
          error: {
            message: `Security error: character '${c}' is not allowed in parameters`,
            code: 'VALIDATION_ERROR',
            category: 'VALIDATION',
            details: {
              forbiddenChar: c,
              location: demonstrativeType.includes(c) ? 'demonstrativeType' : 'layerType',
            },
          },
        };
      }
    }
    if (this.config.isExtendedMode && this.config.demonstrativeType) {
      const patternStr = this.config.demonstrativeType.pattern;
      if (!patternStr || patternStr.trim() === '') {
        return {
          type: 'double',
          demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
          layerType: normalizedLayerType as LayerType,
          options: {},
          error: {
            message: 'Invalid configuration: pattern is required in extended mode',
            code: 'INVALID_CONFIG',
            category: 'CONFIGURATION',
            details: { missingField: 'pattern' },
          },
        };
      }
      if (patternStr.trim() === '.*') {
        return {
          type: 'double',
          demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
          layerType: normalizedLayerType as LayerType,
          options: {},
          error: {
            message: 'Security error: pattern "*" is not allowed',
            code: 'VALIDATION_ERROR',
            category: 'VALIDATION',
            details: { invalidPattern: patternStr },
          },
        };
      }
      let pattern: RegExp;
      try {
        pattern = new RegExp(patternStr);
      } catch (_error) {
        return {
          type: 'double',
          demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
          layerType: normalizedLayerType as LayerType,
          options: {},
          error: {
            message: 'Invalid demonstrative type pattern configuration',
            code: 'INVALID_PATTERN',
            category: 'CONFIGURATION',
            details: { pattern: patternStr },
          },
        };
      }
      if (!pattern.test(demonstrativeType)) {
        return {
          type: 'double',
          demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
          layerType: normalizedLayerType as LayerType,
          options: {},
          error: {
            message: this.config.demonstrativeType.errorMessage ||
              `Invalid demonstrative type: ${demonstrativeType}`,
            code: 'VALIDATION_ERROR',
            category: 'VALIDATION',
            details: { provided: demonstrativeType, pattern: patternStr },
          },
        };
      }
    } else if (!this.demonstrativeTypes.has(normalizedDemonstrativeType as DemonstrativeType)) {
      return {
        type: 'double',
        demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
        layerType: normalizedLayerType as LayerType,
        options: {},
        error: {
          message: `Invalid demonstrative type: ${demonstrativeType}. Must be one of: ${
            Array.from(this.demonstrativeTypes).join(', ')
          }`,
          code: 'VALIDATION_ERROR',
          category: 'VALIDATION',
          details: { provided: demonstrativeType, validTypes: Array.from(this.demonstrativeTypes) },
        },
      };
    }
    if (this.config.isExtendedMode && this.config.layerType) {
      const patternStr = this.config.layerType.pattern;
      if (!patternStr || patternStr.trim() === '') {
        return {
          type: 'double',
          demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
          layerType: normalizedLayerType as LayerType,
          options: {},
          error: {
            message: 'Invalid configuration: pattern is required in extended mode',
            code: 'INVALID_CONFIG',
            category: 'CONFIGURATION',
            details: { missingField: 'pattern' },
          },
        };
      }
      if (patternStr.trim() === '.*') {
        return {
          type: 'double',
          demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
          layerType: normalizedLayerType as LayerType,
          options: {},
          error: {
            message: 'Security error: pattern "*" is not allowed',
            code: 'VALIDATION_ERROR',
            category: 'VALIDATION',
            details: { invalidPattern: patternStr },
          },
        };
      }
      let pattern: RegExp;
      try {
        pattern = new RegExp(patternStr);
      } catch (_error) {
        return {
          type: 'double',
          demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
          layerType: normalizedLayerType as LayerType,
          options: {},
          error: {
            message: 'Invalid layer type pattern configuration',
            code: 'INVALID_PATTERN',
            category: 'CONFIGURATION',
            details: { pattern: patternStr },
          },
        };
      }
      if (!pattern.test(layerType)) {
        return {
          type: 'double',
          demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
          layerType: normalizedLayerType as LayerType,
          options: {},
          error: {
            message: this.config.layerType.errorMessage || `Invalid layer type: ${layerType}`,
            code: 'VALIDATION_ERROR',
            category: 'VALIDATION',
            details: { provided: layerType, pattern: patternStr },
          },
        };
      }
    } else if (!this.layerTypes.has(normalizedLayerType as LayerType)) {
      return {
        type: 'double',
        demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
        layerType: normalizedLayerType as LayerType,
        options: {},
        error: {
          message: `Invalid layer type: ${layerType}. Must be one of: ${
            Array.from(this.layerTypes).join(', ')
          }`,
          code: 'VALIDATION_ERROR',
          category: 'VALIDATION',
          details: { provided: layerType, validTypes: Array.from(this.layerTypes) },
        },
      };
    }
    const options = this.parseOptions(args);
    if ('error' in options) {
      return {
        type: 'double',
        demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
        layerType: normalizedLayerType as LayerType,
        options: {},
        error: options.error,
      };
    }
    return {
      type: 'double',
      demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
      layerType: normalizedLayerType as LayerType,
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
