import { DEFAULT_OPTION_RULE, OptionRule } from '../types/option_rule.ts';
import {
  OneParamsResult,
  ParamsResult,
  TwoParamsResult,
  ZeroParamsResult,
} from '../types/params_result.ts';
import { SecurityValidator } from '../validator/security_validator.ts';
import { OptionCombinationValidator } from '../validator/options/option_combination_validator.ts';
import { DEFAULT_TWO_PARAMS_CONFIG, TwoParamsConfig } from '../types/params_config.ts';
import { CustomConfig, DEFAULT_CUSTOM_CONFIG } from '../types/custom_config.ts';
import { ZeroParamsValidator } from '../validator/params/zero_params_validator.ts';
import { OneParamValidator } from '../validator/params/one_param_validator.ts';
import { TwoParamsValidator } from '../validator/params/two_params_validator.ts';
import {
  OneOptionValidator,
  TwoOptionValidator,
  ZeroOptionValidator,
} from '../validator/options/option_validator.ts';
import { CommandLineOptionFactory } from '../factories/option_factory.ts';
import { BreakdownLogger } from '@tettuan/breakdownlogger';

/**
 * パラメータパーサー
 */
export interface ParamsParser {
  /**
   * パラメータを解析する
   * @param args - Command line arguments
   * @returns ParamsResult containing the parsed parameters and options
   */
  parse(args: string[]): ParamsResult;
}

export class ParamsParser {
  private readonly optionRule: OptionRule;
  private readonly config: TwoParamsConfig;
  private readonly customConfig: CustomConfig;
  private readonly logger: BreakdownLogger;
  /**
   * セキュリティバリデーター
   * パラメータにシステムを壊す不正な文字列がないかをチェックする
   * それ以上のチェックは不要
   */
  private readonly securityValidator: SecurityValidator;
  private readonly optionFactory: CommandLineOptionFactory;
  protected readonly zeroOptionCombinationValidator: OptionCombinationValidator;
  protected readonly oneOptionCombinationValidator: OptionCombinationValidator;
  protected readonly twoOptionCombinationValidator: OptionCombinationValidator;

  constructor(optionRule?: OptionRule, config?: TwoParamsConfig, customConfig?: CustomConfig) {
    this.optionRule = optionRule || DEFAULT_OPTION_RULE;
    this.config = config || DEFAULT_TWO_PARAMS_CONFIG;
    this.customConfig = customConfig || DEFAULT_CUSTOM_CONFIG;
    this.logger = new BreakdownLogger();

    this.securityValidator = new SecurityValidator();
    this.optionFactory = new CommandLineOptionFactory();

    // Use custom config for option combination rules
    const validationRules = this.customConfig.validation;
    this.zeroOptionCombinationValidator = new OptionCombinationValidator({
      allowedOptions: [...validationRules.zero.allowedOptions, ...(validationRules.zero.allowedValueOptions || [])],
    });
    this.oneOptionCombinationValidator = new OptionCombinationValidator({
      allowedOptions: [...validationRules.one.allowedOptions, ...(validationRules.one.allowedValueOptions || [])],
    });
    this.twoOptionCombinationValidator = new OptionCombinationValidator({
      allowedOptions: [...validationRules.two.allowedOptions, ...(validationRules.two.allowedValueOptions || [])],
    });
  }

  /**
   * Factoryを使用してオプションを抽出する
   * @param args - コマンドライン引数
   * @returns 抽出されたオプション
   */
  private extractOptionsUsingFactory(args: string[]): Record<string, unknown> {
    const options: Record<string, unknown> = {};
    const optionArgs = args.filter((arg) => arg.startsWith('--') || arg.startsWith('-'));

    for (const arg of optionArgs) {
      try {
        const option = this.optionFactory.createOptionsFromArgs([arg])[0];
        if (option) {
          // Use the option's normalized name method
          const optionName = option.toNormalized();
          // Get the value from the option instance
          const value = option.getValue();
          options[optionName] = value;
        }
      } catch (error) {
        // Flag options with values should throw an error
        if (
          error instanceof Error && error.message.includes('Flag option') &&
          error.message.includes('should not have a value')
        ) {
          throw error;
        }
        // その他の無効なオプションは無視
        this.logger.debug(`Skipping invalid option: ${arg}`, error);
      }
    }

    return options;
  }

  /**
   * パラメータを解析する
   * 処理の流れ:
   * 1. セキュリティチェック
   * 2. パラメータとオプションの分離
   * 3. パラメータ数のバリデーション（0個、1個、2個）
   * 4. パラメータ数に応じたオプションのバリデーション
   *    - オプションの存在チェック
   *    - オプションの組み合わせチェック
   */
  public parse(args: string[]): ParamsResult {
    // 1. セキュリティチェック
    // パラメータにシステムを壊す不正な文字列がないかをチェックする
    // それ以上のチェックは不要
    const securityResult = this.securityValidator.validate(args);
    if (!securityResult.isValid) {
      return {
        type: 'error',
        params: [],
        options: {},
        error: {
          message: securityResult.errorMessage || 'Security error',
          code: securityResult.errorCode || 'SECURITY_ERROR',
          category: securityResult.errorCategory || 'security',
        },
      };
    }

    // 2. パラメータとオプションを分離する
    // パラメータは、オプションではないもの
    // オプションは、-- または - から始まるもの
    const params = args.filter((arg) => !arg.startsWith('--') && !arg.startsWith('-'));

    let options: Record<string, unknown>;
    try {
      options = this.extractOptionsUsingFactory(args);
    } catch (error) {
      if (error instanceof Error) {
        return {
          type: 'error',
          params: [],
          options: {},
          error: {
            message: error.message,
            code: 'INVALID_OPTION_FORMAT',
            category: 'invalid_format',
          },
        };
      }
      throw error;
    }

    // 3. パラメータのバリデーション
    // パラメータの数に応じて、バリデーションを行う
    // 3つ同時にバリデーションを行い、それぞれの結果を判定する
    const zeroValidator = new ZeroParamsValidator();
    const oneValidator = new OneParamValidator();
    const twoValidator = new TwoParamsValidator({
      demonstrativeType: this.customConfig.params.two.demonstrativeType,
      layerType: this.customConfig.params.two.layerType,
    });

    const zeroResult = zeroValidator.validate(params);
    const oneResult = oneValidator.validate(params);
    const twoResult = twoValidator.validate(params);

    this.logger.debug('Validation results:', {
      zeroResult,
      oneResult,
      twoResult,
    });

    /*
     * 4. パラメータ数に応じたオプションのバリデーション
     * 4.1. 0個の場合
     */
    if (zeroResult.isValid && !oneResult.isValid && !twoResult.isValid) {
      // 4.1.1. オプションの存在チェック
      const optionValidator = new ZeroOptionValidator();
      const optionResult = optionValidator.validate(args, 'zero', this.optionRule);

      if (!optionResult.isValid) {
        return {
          type: 'error',
          params: [],
          options: {},
          error: {
            message: optionResult.errorMessage || 'Invalid options',
            code: optionResult.errorCode || 'INVALID_OPTIONS',
            category: optionResult.errorCategory || 'validation',
          },
        };
      }

      // 4.1.2. オプションの組み合わせチェック
      const zeroOptionCombinationResult = this.zeroOptionCombinationValidator.validate(options);

      if (!zeroOptionCombinationResult.isValid) {
        return {
          type: 'error',
          params: [],
          options: {},
          error: {
            message: zeroOptionCombinationResult.errorMessage || 'Invalid option combination',
            code: zeroOptionCombinationResult.errorCode || 'INVALID_OPTION_COMBINATION',
            category: zeroOptionCombinationResult.errorCategory || 'validation',
          },
        };
      }

      return {
        type: 'zero',
        params: [],
        options,
      } as ZeroParamsResult;
    }

    /*
     * 4.2. 1個の場合
     */
    if (!zeroResult.isValid && oneResult.isValid && !twoResult.isValid) {
      // 4.2.1. オプションの存在チェック
      const optionValidator = new OneOptionValidator();
      const optionResult = optionValidator.validate(args, 'one', this.optionRule);

      if (!optionResult.isValid) {
        return {
          type: 'error',
          params: [],
          options: {},
          error: {
            message: optionResult.errorMessage || 'Invalid options',
            code: optionResult.errorCode || 'INVALID_OPTIONS',
            category: optionResult.errorCategory || 'validation',
          },
        };
      }

      // 4.2.2. オプションの組み合わせチェック
      const oneOptionCombinationResult = this.oneOptionCombinationValidator.validate(options);

      if (!oneOptionCombinationResult.isValid) {
        return {
          type: 'error',
          params: [],
          options: {},
          error: {
            message: oneOptionCombinationResult.errorMessage || 'Invalid option combination',
            code: oneOptionCombinationResult.errorCode || 'INVALID_OPTION_COMBINATION',
            category: oneOptionCombinationResult.errorCategory || 'validation',
          },
        };
      }

      return {
        type: 'one',
        params: oneResult.validatedParams,
        options,
        demonstrativeType: oneResult.validatedParams[0],
      } as OneParamsResult;
    }

    /*
     * 4.3. 2個の場合
     */
    if (!zeroResult.isValid && !oneResult.isValid && twoResult.isValid) {
      // 4.3.1. オプションの存在チェック
      const optionValidator = new TwoOptionValidator();
      const optionResult = optionValidator.validate(args, 'two', this.optionRule);

      if (!optionResult.isValid) {
        return {
          type: 'error',
          params: [],
          options: {},
          error: {
            message: optionResult.errorMessage || 'Invalid options',
            code: optionResult.errorCode || 'INVALID_OPTIONS',
            category: optionResult.errorCategory || 'validation',
          },
        };
      }

      // 4.3.2. オプションの組み合わせチェック
      const twoOptionCombinationResult = this.twoOptionCombinationValidator.validate(options);

      if (!twoOptionCombinationResult.isValid) {
        return {
          type: 'error',
          params: [],
          options: {},
          error: {
            message: twoOptionCombinationResult.errorMessage || 'Invalid option combination',
            code: twoOptionCombinationResult.errorCode || 'INVALID_OPTION_COMBINATION',
            category: twoOptionCombinationResult.errorCategory || 'validation',
          },
        };
      }

      return {
        type: 'two',
        params: twoResult.validatedParams,
        options,
        demonstrativeType: twoResult.validatedParams[0],
        layerType: twoResult.validatedParams[1],
      } as TwoParamsResult;
    }

    /*
     * パラメータのバリデーションが失敗した場合は、パラメータ数に応じて適切なエラーを返却する
     */
    // パラメータ数に基づいて、どのバリデーターのエラーを使用するか決定
    let errorMessage: string | undefined;
    let errorCode: string | undefined;
    let errorCategory: string | undefined;

    if (params.length === 0) {
      // 0個の場合は、オプションのみが許可される
      errorMessage = 'No command specified. Use --help for usage information';
      errorCode = 'NO_COMMAND';
      errorCategory = 'validation';
    } else if (params.length === 1) {
      // 1個の場合は、OneParamValidatorのエラーを使用
      errorMessage = oneResult.errorMessage || 'Invalid command';
      errorCode = oneResult.errorCode || 'INVALID_COMMAND';
      errorCategory = oneResult.errorCategory || 'validation';
    } else if (params.length === 2) {
      // 2個の場合は、TwoParamsValidatorのエラーを使用
      errorMessage = twoResult.errorMessage || 'Invalid parameters';
      errorCode = twoResult.errorCode || 'INVALID_PARAMS';
      errorCategory = twoResult.errorCategory || 'validation';
    } else {
      // 3個以上の場合は、引数が多すぎるエラー
      errorMessage = 'Too many arguments. Maximum 2 arguments are allowed';
      errorCode = 'TOO_MANY_ARGS';
      errorCategory = 'validation';
    }

    return {
      type: 'error',
      params: [],
      options: {},
      error: {
        message: errorMessage,
        code: errorCode,
        category: errorCategory,
      },
    };
  }
}
