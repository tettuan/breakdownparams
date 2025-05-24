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
 * A class to parse and validate command line arguments.
 *
 * This class provides functionality to parse command line arguments
 * with type safety and validation.
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
   * Create a new ParamsParser instance.
   *
   * @param config - Optional configuration for extended mode validation
   */
  constructor(config?: ParserConfig) {
    this.config = config || { isExtendedMode: false };
  }

  /**
   * Parse command line arguments.
   *
   * This method parses the command line arguments and returns a result
   * indicating whether the parsing was successful or not.
   *
   * @param args - The command line arguments to parse
   * @returns A result object containing either the parsed data or an error message
   */
  parse(args: string[]): ParamsResult {
    console.debug('[DEBUG] Parsing arguments:', args);
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
      console.debug('[DEBUG] Non-option arguments:', nonOptionArgs);

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
      console.debug('[DEBUG] Error parsing arguments:', error);
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
            code: 'SECURITY_ERROR',
            category: 'SECURITY',
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
            code: 'SECURITY_ERROR',
            category: 'SECURITY',
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
            code: 'INVALID_DEMONSTRATIVE_TYPE',
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
          code: 'INVALID_DEMONSTRATIVE_TYPE',
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
            code: 'SECURITY_ERROR',
            category: 'SECURITY',
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
            code: 'INVALID_LAYER_TYPE',
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
          code: 'INVALID_LAYER_TYPE',
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
    // Track long and short form values separately
    const longForm: Record<string, string | undefined> = {};
    const shortForm: Record<string, string | undefined> = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith('--')) {
        if (arg === '--help' || arg === '--version') {
          continue;
        }
        // Handle custom variable options (--uv-*)
        if (arg.startsWith('--uv-')) {
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
            for (const c of forbiddenChars) {
              if (value.includes(c)) {
                return {
                  error: {
                    message: `Security error: character '${c}' is not allowed in parameters`,
                    code: 'SECURITY_ERROR',
                    category: 'SECURITY',
                    details: { forbiddenChar: c, location: `customVariableValue:${name}` },
                  },
                };
              }
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
          for (const c of forbiddenChars) {
            if (nextArg.includes(c)) {
              return {
                error: {
                  message: `Security error: character '${c}' is not allowed in parameters`,
                  code: 'SECURITY_ERROR',
                  category: 'SECURITY',
                  details: { forbiddenChar: c, location: `customVariableValue:${name}` },
                },
              };
            }
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
                    code: 'INVALID_LAYER_TYPE',
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
                  code: 'UNKNOWN_OPTION',
                  category: 'SYNTAX',
                  details: { provided: opt },
                },
              };
          }
          continue;
        }
        const nextArg = args[i + 1];
        if (!nextArg || nextArg.startsWith('-')) {
          return {
            error: {
              message: `Missing value for option: ${arg}`,
              code: 'MISSING_VALUE_FOR_OPTION',
              category: 'SYNTAX',
              details: { option: arg },
            },
          };
        }
        switch (arg) {
          case '--from':
            longForm.fromFile = nextArg;
            break;
          case '--destination':
            longForm.destinationFile = nextArg;
            break;
          case '--input':
            if (!this.layerTypes.has(nextArg as LayerType)) {
              return {
                error: {
                  message: `Invalid layer type: ${nextArg}`,
                  code: 'INVALID_LAYER_TYPE',
                  category: 'VALIDATION',
                  details: { provided: nextArg, validTypes: Array.from(this.layerTypes) },
                },
              };
            }
            longForm.fromLayerType = nextArg;
            break;
          case '--adaptation':
            longForm.adaptationType = nextArg;
            break;
          case '--config':
            longForm.configFile = nextArg;
            break;
          default:
            return {
              error: {
                message: `Unknown option: ${arg}`,
                code: 'UNKNOWN_OPTION',
                category: 'SYNTAX',
                details: { provided: arg },
              },
            };
        }
        i++;
      } else if (arg.startsWith('-')) {
        if (arg === '-h' || arg === '-v') {
          continue;
        }
        const nextArg = args[i + 1];
        if (!nextArg || nextArg.startsWith('-')) {
          return {
            error: {
              message: `Missing value for option: ${arg}`,
              code: 'MISSING_VALUE_FOR_OPTION',
              category: 'SYNTAX',
              details: { option: arg },
            },
          };
        }
        switch (arg) {
          case '-f':
            shortForm.fromFile = nextArg;
            break;
          case '-o':
            shortForm.destinationFile = nextArg;
            break;
          case '-i':
            if (!this.layerTypes.has(nextArg as LayerType)) {
              return {
                error: {
                  message: `Invalid layer type: ${nextArg}`,
                  code: 'INVALID_LAYER_TYPE',
                  category: 'VALIDATION',
                  details: { provided: nextArg, validTypes: Array.from(this.layerTypes) },
                },
              };
            }
            shortForm.fromLayerType = nextArg;
            break;
          case '-a':
            shortForm.adaptationType = nextArg;
            break;
          case '-c':
            shortForm.configFile = nextArg;
            break;
          default:
            return {
              error: {
                message: `Unknown option: ${arg}`,
                code: 'UNKNOWN_OPTION',
                category: 'SYNTAX',
                details: { provided: arg },
              },
            };
        }
        i++;
      }
    }
    // Assign options, preferring long form over short form
    options.fromFile = longForm.fromFile ?? shortForm.fromFile;
    options.destinationFile = longForm.destinationFile ?? shortForm.destinationFile;
    options.fromLayerType = (longForm.fromLayerType ?? shortForm.fromLayerType) as
      | LayerType
      | undefined;
    options.adaptationType = longForm.adaptationType ?? shortForm.adaptationType;
    options.configFile = longForm.configFile ?? shortForm.configFile;
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
