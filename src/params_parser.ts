import {
  DemonstrativeType,
  DoubleParamsResult,
  ErrorInfo,
  LayerType,
  NoParamsResult,
  OptionParams,
  ParamsResult,
  ParserConfig,
  SingleParamResult,
  ErrorCode,
  ErrorCategory,
} from './types.ts';
import { ValidatorFactory } from './validators/validator_factory.ts';
import { NoParamsParser } from './parsers/no_params_parser.ts';
import { SingleParamParser } from './parsers/single_param_parser.ts';
import { DoubleParamsParser } from './parsers/double_params_parser.ts';
import { OptionParser } from './utils/option_parser.ts';

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
  private readonly layerTypes = new Set<LayerType>([
    'project',
    'issue',
    'task'
  ]);

  private readonly noParamsParser: NoParamsParser;
  private readonly singleParamParser: SingleParamParser;
  private readonly doubleParamsParser: DoubleParamsParser;
  private readonly optionParser: OptionParser;

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
    this.noParamsParser = new NoParamsParser();
    this.singleParamParser = new SingleParamParser();
    this.doubleParamsParser = new DoubleParamsParser();
    this.optionParser = new OptionParser();
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
    // 追加: 設定エラーを先に検出
    if (this.config.isExtendedMode) {
      // 空パターン
      if (this.config.demonstrativeType?.pattern === '') {
        return {
          type: 'double',
          demonstrativeType: (args[0] ?? '') as DemonstrativeType,
          layerType: (args[1] ?? '') as LayerType,
          options: {},
          error: {
            message: 'Invalid configuration: pattern is required in extended mode',
            code: ErrorCode.INVALID_CONFIG,
            category: ErrorCategory.CONFIGURATION,
            details: { missingField: 'pattern' },
          },
        };
      }
      if (this.config.layerType?.pattern === '') {
        return {
          type: 'double',
          demonstrativeType: (args[0] ?? '') as DemonstrativeType,
          layerType: (args[1] ?? '') as LayerType,
          options: {},
          error: {
            message: 'Invalid configuration: pattern is required in extended mode',
            code: ErrorCode.INVALID_CONFIG,
            category: ErrorCategory.CONFIGURATION,
            details: { missingField: 'pattern' },
          },
        };
      }
      // 正規表現不正
      try {
        if (this.config.demonstrativeType?.pattern) {
          new RegExp(this.config.demonstrativeType.pattern);
        }
        if (this.config.layerType?.pattern) {
          new RegExp(this.config.layerType.pattern);
        }
      } catch (_error) {
        return {
          type: 'double',
          demonstrativeType: (args[0] ?? '') as DemonstrativeType,
          layerType: (args[1] ?? '') as LayerType,
          options: {},
          error: {
            message: 'Invalid demonstrative type pattern configuration',
            code: ErrorCode.INVALID_PATTERN,
            category: ErrorCategory.CONFIGURATION,
            details: { pattern: this.config.demonstrativeType?.pattern },
          },
        };
      }
      // セキュリティチェック
      const forbiddenChars = [';', '&', '`'];
      if (this.config.demonstrativeType?.pattern) {
        for (const c of forbiddenChars) {
          if (this.config.demonstrativeType.pattern.includes(c)) {
            return {
              type: 'double',
              demonstrativeType: (args[0] ?? '') as DemonstrativeType,
              layerType: (args[1] ?? '') as LayerType,
              options: {},
              error: {
                message: `Security error: character '${c}' is not allowed in pattern`,
                code: ErrorCode.SECURITY_ERROR,
                category: ErrorCategory.SECURITY,
                details: { pattern: this.config.demonstrativeType.pattern },
              },
            };
          }
        }
      }
      if (this.config.layerType?.pattern) {
        for (const c of forbiddenChars) {
          if (this.config.layerType.pattern.includes(c)) {
            return {
              type: 'double',
              demonstrativeType: (args[0] ?? '') as DemonstrativeType,
              layerType: (args[1] ?? '') as LayerType,
              options: {},
              error: {
                message: `Security error: character '${c}' is not allowed in pattern`,
                code: ErrorCode.SECURITY_ERROR,
                category: ErrorCategory.SECURITY,
                details: { pattern: this.config.layerType.pattern },
              },
            };
          }
        }
      }
    }
    try {
      // Early check: if all args are help/version flags, call parseNoParams directly
      const isAllHelpOrVersion = args.length > 0 && args.every(arg => arg === '-h' || arg === '--help' || arg === '-v' || arg === '--version');
      if (isAllHelpOrVersion) {
        return this.noParamsParser.parse(args);
      }

      // ここから従来通り nonOptionArgs を構築
      const nonOptionArgs: string[] = [];
      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (!arg.startsWith('-')) {
          nonOptionArgs.push(arg);
        } else if (arg.startsWith('--uv-')) {
          // skip value after --uv-*
          const hasEquals = arg.includes('=');
          if (!hasEquals) {
            i++; // always skip next value, even if empty string
          }
        } else {
          const nextArg = args[i + 1];
          if (nextArg && !nextArg.startsWith('-')) {
            i++;
          }
        }
      }

      if (nonOptionArgs.length === 0) {
        return this.noParamsParser.parse(args);
      } else if (nonOptionArgs.length === 1) {
        return this.singleParamParser.parse(nonOptionArgs[0], args);
      } else if (nonOptionArgs.length === 2) {
        if (nonOptionArgs[0] === '') {
          return {
            type: 'double',
            demonstrativeType: nonOptionArgs[0] as DemonstrativeType,
            layerType: nonOptionArgs[1] as LayerType,
            options: {},
            error: {
              message: 'Required argument demonstrativeType is empty.',
              code: ErrorCode.MISSING_REQUIRED_ARGUMENT,
              category: ErrorCategory.VALIDATION,
              details: { field: 'demonstrativeType' },
            },
          };
        }
        if (nonOptionArgs[1] === '') {
          return {
            type: 'double',
            demonstrativeType: nonOptionArgs[0] as DemonstrativeType,
            layerType: nonOptionArgs[1] as LayerType,
            options: {},
            error: {
              message: 'Required argument layerType is empty.',
              code: ErrorCode.MISSING_REQUIRED_ARGUMENT,
              category: ErrorCategory.VALIDATION,
              details: { field: 'layerType' },
            },
          };
        }
        return this.doubleParamsParser.parse(nonOptionArgs[0], nonOptionArgs[1], args);
      } else {
        // Too many arguments
        return {
          type: 'no-params',
          help: false,
          version: false,
          error: {
            message: 'Too many arguments. Maximum 2 arguments are allowed.',
            code: ErrorCode.TOO_MANY_ARGUMENTS,
            category: ErrorCategory.SYNTAX,
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
          code: ErrorCode.UNEXPECTED_ERROR,
          category: ErrorCategory.UNEXPECTED,
          details: error instanceof Error ? { stack: error.stack } : undefined,
        },
      };
    }
  }
}
