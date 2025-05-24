import {
  DemonstrativeType,
  DoubleParamsResult,
  LayerType,
  NoParamsResult,
  ParamsResult,
  ParserConfig,
  SingleParamResult,
  ParseResult,
  ErrorResult,
} from '../definitions/types.ts';
import { ValidatorFactory } from '../../../validators/validator_factory.ts';
import { NoParamsParser } from './no_params_parser.ts';
import { SingleParamParser } from './single_param_parser.ts';
import { DoubleParamsParser } from './double_params_parser.ts';
import { OptionParser } from '../../options/processors/option_parser.ts';
import { ConfigValidator } from '../../../validators/config_validator.ts';
import { SecurityValidator } from '../../../validators/security_validator.ts';
import { ErrorFactory } from '../../errors/error_factory.ts';
import { ERROR_MESSAGES } from '../../../constants/error_messages.ts';

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

  private readonly configValidator: ConfigValidator;
  private readonly securityValidator: SecurityValidator;
  private readonly patternCache: Map<string, RegExp>;

  /**
   * Create a new ParamsParser instance with optional configuration.
   *
   * The configuration allows for extended mode validation and custom validation rules
   * for demonstrative types and layer types.
   *
   * @param config - Optional configuration for extended mode validation and custom rules
   * @param configValidator - Optional config validator
   * @param securityValidator - Optional security validator
   * @throws {Error} If the configuration is invalid
   * @since 1.0.0
   */
  constructor(
    config?: ParserConfig,
    configValidator?: ConfigValidator,
    securityValidator?: SecurityValidator
  ) {
    this.config = config || { isExtendedMode: false };
    const validatorFactory = ValidatorFactory.getInstance();
    this.noParamsParser = new NoParamsParser(validatorFactory);
    this.singleParamParser = new SingleParamParser(validatorFactory);
    this.doubleParamsParser = new DoubleParamsParser(validatorFactory, this.config);
    this.optionParser = new OptionParser();

    this.configValidator = configValidator ?? new ConfigValidator();
    this.securityValidator = securityValidator ?? new SecurityValidator();
    this.patternCache = new Map<string, RegExp>();
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
  public parse(args: string[]): ParseResult<ParamsResult> {
    // 設定バリデーション
    const configError = this.configValidator.validate(this.config ?? {});
    if (configError) {
      return this.createErrorResult(configError);
    }

    // セキュリティチェック
    if (this.config?.isExtendedMode && this.config.demonstrativeType?.pattern) {
      const securityError = this.securityValidator.validatePattern(this.config.demonstrativeType.pattern);
      if (securityError) {
        return this.createErrorResult(securityError);
      }
    }

    // 引数解析
    const nonOptionArgs = this.parseNonOptionArgs(args);
    if (nonOptionArgs.length > 2) {
      return this.createErrorResult(
        ErrorFactory.createValidationError(ERROR_MESSAGES.VALIDATION_ERROR.TOO_MANY_ARGUMENTS)
      );
    }

    // 引数の数に応じて処理を分岐
    if (nonOptionArgs.length === 0) {
      return this.parseNoParams(args);
    } else if (nonOptionArgs.length === 1) {
      return this.parseSingleParam(nonOptionArgs[0], args);
    } else {
      return this.parseDoubleParams(nonOptionArgs[0], nonOptionArgs[1], args);
    }
  }

  private getPattern(pattern: string): RegExp {
    if (!this.patternCache.has(pattern)) {
      this.patternCache.set(pattern, new RegExp(pattern));
    }
    return this.patternCache.get(pattern)!;
  }

  private createErrorResult(error: ErrorResult): ParseResult<ParamsResult> {
    return {
      type: 'double',
      demonstrativeType: 'to',
      layerType: 'project',
      options: {},
      error
    };
  }

  private parseNoParams(args: string[]): NoParamsResult {
    const help = args.includes('-h') || args.includes('--help');
    const version = args.includes('-v') || args.includes('--version');

    return {
      type: 'no-params',
      help,
      version
    };
  }

  private parseSingleParam(param: string, args: string[]): SingleParamResult {
    if (!this.validSingleCommands.has(param)) {
      return {
        type: 'single',
        command: 'init',
        options: {},
        error: ErrorFactory.createValidationError(
          ERROR_MESSAGES.VALIDATION_ERROR.INVALID_COMMAND.replace('{command}', param)
        )
      };
    }

    const options = this.optionParser.parse(args);
    if ('error' in options) {
      return {
        type: 'single',
        command: 'init',
        options: {},
        error: ErrorFactory.createValidationError(options.error)
      };
    }

    return {
      type: 'single',
      command: 'init',
      options
    };
  }

  private parseDoubleParams(demonstrativeType: string, layerType: string, args: string[]): DoubleParamsResult {
    // 空の引数チェック
    if (demonstrativeType === '') {
      return {
        type: 'double',
        demonstrativeType: 'to',
        layerType: 'project',
        options: {},
        error: ErrorFactory.createValidationError(
          ERROR_MESSAGES.VALIDATION_ERROR.MISSING_REQUIRED_ARGUMENT.replace('{field}', 'demonstrativeType')
        )
      };
    }

    if (layerType === '') {
      return {
        type: 'double',
        demonstrativeType: 'to',
        layerType: 'project',
        options: {},
        error: ErrorFactory.createValidationError(
          ERROR_MESSAGES.VALIDATION_ERROR.MISSING_REQUIRED_ARGUMENT.replace('{field}', 'layerType')
        )
      };
    }

    // 拡張モードでのバリデーション
    if (this.config.isExtendedMode) {
      if (this.config.demonstrativeType?.pattern) {
        const pattern = this.getPattern(this.config.demonstrativeType.pattern);
        if (!pattern.test(demonstrativeType)) {
          return {
            type: 'double',
            demonstrativeType: 'to',
            layerType: 'project',
            options: {},
            error: ErrorFactory.createValidationError(
              ERROR_MESSAGES.VALIDATION_ERROR.INVALID_DEMONSTRATIVE_TYPE.replace('{type}', demonstrativeType)
            )
          };
        }
      }

      if (this.config.layerType?.pattern) {
        const pattern = this.getPattern(this.config.layerType.pattern);
        if (!pattern.test(layerType)) {
          return {
            type: 'double',
            demonstrativeType: 'to',
            layerType: 'project',
            options: {},
            error: ErrorFactory.createValidationError(
              ERROR_MESSAGES.VALIDATION_ERROR.INVALID_LAYER_TYPE.replace('{type}', layerType)
            )
          };
        }
      }
    } else {
      // 標準モードでのバリデーション
      if (!this.demonstrativeTypes.has(demonstrativeType as DemonstrativeType)) {
        return {
          type: 'double',
          demonstrativeType: 'to',
          layerType: 'project',
          options: {},
          error: ErrorFactory.createValidationError(
            ERROR_MESSAGES.VALIDATION_ERROR.INVALID_DEMONSTRATIVE_TYPE.replace('{type}', demonstrativeType)
          )
        };
      }

      if (!this.layerTypes.has(layerType as LayerType)) {
        return {
          type: 'double',
          demonstrativeType: 'to',
          layerType: 'project',
          options: {},
          error: ErrorFactory.createValidationError(
            ERROR_MESSAGES.VALIDATION_ERROR.INVALID_LAYER_TYPE.replace('{type}', layerType)
          )
        };
      }
    }

    // オプション解析
    const options = this.optionParser.parse(args);
    if ('error' in options) {
      return {
        type: 'double',
        demonstrativeType: demonstrativeType as DemonstrativeType,
        layerType: layerType as LayerType,
        options: {},
        error: ErrorFactory.createValidationError(options.error)
      };
    }

    return {
      type: 'double',
      demonstrativeType: demonstrativeType as DemonstrativeType,
      layerType: layerType as LayerType,
      options
    };
  }

  private parseNonOptionArgs(args: string[]): string[] {
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
      }
    }
    return nonOptionArgs;
  }
}
