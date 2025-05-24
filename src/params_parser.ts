import {
  DemonstrativeType,
  DoubleParamsResult,
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
    try {
      const nonOptionArgs: string[] = [];
      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (!arg.startsWith('-')) {
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
        return {
          type: 'no-params',
          error: 'Too many arguments. Maximum 2 arguments are allowed.',
        };
      }
    } catch (error) {
      return {
        type: 'no-params',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
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

    for (const arg of args) {
      if (arg === '--help' || arg === '-h') result.help = true;
      if (arg === '--version' || arg === '-v') result.version = true;
    }

    // configオプションは無視

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
  ): SingleParamResult | NoParamsResult {
    if (!this.validSingleCommands.has(command)) {
      return {
        type: 'no-params',
        error: `Invalid command: ${command}`,
        help: false,
        version: false,
      };
    }

    const options = this.parseOptions(args);
    if ('error' in options) {
      return {
        type: 'single',
        command: 'init',
        error: options.error,
      };
    }

    // configオプションを無視
    const { configFile: _configFile, ...validOptions } = options;

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
  ): DoubleParamsResult | { type: 'error'; error: string } {
    const normalizedDemonstrativeType = demonstrativeType;
    const normalizedLayerType = layerType;

    // セキュリティ: 許可しない文字リスト
    const forbiddenChars = [';', '|', '&', '`', '$', '>', '<'];

    // Extended mode validation for demonstrative type
    if (this.config.isExtendedMode && this.config.demonstrativeType) {
      const patternStr = this.config.demonstrativeType.pattern;
      if (!patternStr) {
        return {
          type: 'error',
          error: 'Invalid configuration: pattern is required in extended mode',
        };
      }
      // セキュリティ: 何でも許可するパターンは禁止
      if (patternStr.trim() === '.*') {
        return {
          type: 'error',
          error: 'Security error: pattern ".*" is not allowed',
        };
      }
      let pattern: RegExp;
      try {
        pattern = new RegExp(patternStr);
      } catch (_error) {
        return {
          type: 'error',
          error: 'Invalid demonstrative type pattern configuration',
        };
      }
      if (!pattern.test(normalizedDemonstrativeType)) {
        return {
          type: 'error',
          error: this.config.demonstrativeType.errorMessage ||
            `Invalid demonstrative type: ${demonstrativeType}`,
        };
      }
      // セキュリティ: 許可しない文字が含まれていればエラー
      for (const c of forbiddenChars) {
        if (normalizedDemonstrativeType.includes(c)) {
          return {
            type: 'error',
            error: `Security error: character '${c}' is not allowed in demonstrativeType`,
          };
        }
      }
    } else if (
      !this.demonstrativeTypes.has(
        normalizedDemonstrativeType.toLowerCase() as DemonstrativeType,
      )
    ) {
      return {
        type: 'double',
        error:
          `Invalid demonstrative type: ${demonstrativeType}. Must be one of: to, summary, defect`,
      };
    }

    // Extended mode validation for layer type
    if (this.config.isExtendedMode && this.config.layerType) {
      const patternStr = this.config.layerType.pattern;
      if (!patternStr) {
        return {
          type: 'error',
          error: 'Invalid configuration: pattern is required in extended mode',
        };
      }
      // セキュリティ: 何でも許可するパターンは禁止
      if (patternStr.trim() === '.*') {
        return {
          type: 'error',
          error: 'Security error: pattern ".*" is not allowed',
        };
      }
      let pattern: RegExp;
      try {
        pattern = new RegExp(patternStr);
      } catch (_error) {
        return {
          type: 'error',
          error: 'Invalid layer type pattern configuration',
        };
      }
      if (!pattern.test(normalizedLayerType)) {
        return {
          type: 'error',
          error: this.config.layerType.errorMessage || `Invalid layer type: ${layerType}`,
        };
      }
      // セキュリティ: 許可しない文字が含まれていればエラー
      for (const c of forbiddenChars) {
        if (normalizedLayerType.includes(c)) {
          return {
            type: 'error',
            error: `Security error: character '${c}' is not allowed in layerType`,
          };
        }
      }
    }

    // 拡張モード時は値をそのままセット（型安全性はテストで担保）
    if (this.config.isExtendedMode) {
      const options = this.parseOptions(args);
      if ('error' in options) {
        return {
          type: 'double',
          demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
          layerType: normalizedLayerType as LayerType,
          error: options.error,
        };
      }
      return {
        type: 'double',
        demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
        layerType: normalizedLayerType as LayerType,
        options,
      };
    }

    // 標準モード: alias map
    const mappedLayerType =
      LayerTypeAliasMap[normalizedLayerType.toLowerCase() as keyof typeof LayerTypeAliasMap];
    if (!mappedLayerType) {
      return {
        type: 'double',
        error: `Invalid layer type: ${layerType}`,
      };
    }
    const options = this.parseOptions(args);
    if ('error' in options) {
      return {
        type: 'double',
        demonstrativeType: normalizedDemonstrativeType as DemonstrativeType,
        layerType: mappedLayerType,
        error: options.error,
      };
    }
    return {
      type: 'double',
      demonstrativeType: normalizedDemonstrativeType.toLowerCase() as DemonstrativeType,
      layerType: mappedLayerType,
      options,
    };
  }

  /**
   * Parse command line options.
   *
   * This method extracts and parses command line options from the arguments.
   *
   * @param args - The command line arguments to parse
   * @returns An object containing the parsed options or an error
   */
  private parseOptions(args: string[]): OptionParams | { error: string } {
    const options: OptionParams = {};

    // ロングフォームを先に処理
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const nextArg = args[i + 1];

      if (!nextArg || nextArg.startsWith('-')) continue;

      if (
        arg === '--from' ||
        arg === '--destination' ||
        arg === '--input' ||
        arg === '--adaptation' ||
        arg === '--config'
      ) {
        if (arg === '--from') options.fromFile = nextArg;
        if (arg === '--destination') options.destinationFile = nextArg;
        if (arg === '--input') {
          const value = nextArg.toLowerCase();
          if (value in LayerTypeAliasMap) {
            options.fromLayerType = LayerTypeAliasMap[value as keyof typeof LayerTypeAliasMap];
          }
        }
        if (arg === '--adaptation') {
          if (!/^[a-zA-Z0-9_-]+$/.test(nextArg)) {
            return {
              error:
                `Invalid adaptation value: '${nextArg}'. Only alphanumeric characters, underscores, and hyphens are allowed.`,
            };
          }
          options.adaptationType = nextArg;
        }
        if (arg === '--config') {
          options.configFile = nextArg;
        }
        i++;
      }
    }

    // ショートハンドは、ロングフォームが未設定の場合のみ処理
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const nextArg = args[i + 1];

      if (!nextArg || nextArg.startsWith('-')) continue;

      if (arg === '-f' && !options.fromFile) {
        options.fromFile = nextArg;
        i++;
      } else if (arg === '-o' && !options.destinationFile) {
        options.destinationFile = nextArg;
        i++;
      } else if (arg === '-i' && !options.fromLayerType) {
        const value = nextArg.toLowerCase();
        if (value in LayerTypeAliasMap) {
          options.fromLayerType = LayerTypeAliasMap[value as keyof typeof LayerTypeAliasMap];
        }
        i++;
      } else if (arg === '-a' && !options.adaptationType) {
        if (!/^[a-zA-Z0-9_-]+$/.test(nextArg)) {
          return {
            error:
              `Invalid adaptation value: '${nextArg}'. Only alphanumeric characters, underscores, and hyphens are allowed.`,
          };
        }
        options.adaptationType = nextArg;
        i++;
      } else if (arg === '-c' && !options.configFile) {
        options.configFile = nextArg;
        i++;
      }
    }

    return options;
  }
}
