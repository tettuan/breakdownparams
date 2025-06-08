import { OptionRule, DEFAULT_OPTION_RULE } from '../types/option_rule.ts';
import { ParamsResult, ZeroParamsResult, OneParamResult, TwoParamResult } from '../types/params_result.ts';
import { SecurityValidator } from '../validator/security_validator.ts';
import { OptionCombinationValidator } from '../validator/options/option_combination_validator.ts';
import { DEFAULT_OPTION_COMBINATION_RULES } from '../validator/options/option_combination_rule.ts';
import { TwoParamsConfig, DEFAULT_TWO_PARAMS_CONFIG } from "../types/params_config.ts";
import { ZeroParamsValidator } from '../validator/params/zero_params_validator.ts';
import { OneParamValidator } from '../validator/params/one_param_validator.ts';
import { TwoParamsValidator } from '../validator/params/two_params_validator.ts';
import { ZeroOptionValidator, OneOptionValidator, TwoOptionValidator } from '../validator/options/option_validator.ts';
import { CommandLineOptionRegistry } from '../registries/option_registry.ts';

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
  /**
   * セキュリティバリデーター
   * パラメータにシステムを壊す不正な文字列がないかをチェックする
   * それ以上のチェックは不要
   */
  private readonly securityValidator: SecurityValidator;
  private readonly optionRegistry: CommandLineOptionRegistry;
  protected readonly zeroOptionCombinationValidator: OptionCombinationValidator;
  protected readonly oneOptionCombinationValidator: OptionCombinationValidator;
  protected readonly twoOptionCombinationValidator: OptionCombinationValidator;

  constructor(optionRule?: OptionRule, config?: TwoParamsConfig) {
    this.optionRule = optionRule || DEFAULT_OPTION_RULE;
    this.config = config || DEFAULT_TWO_PARAMS_CONFIG;

    this.securityValidator = new SecurityValidator();
    this.optionRegistry = new CommandLineOptionRegistry(this.optionRule);
    this.zeroOptionCombinationValidator = new OptionCombinationValidator(DEFAULT_OPTION_COMBINATION_RULES.zero);
    this.oneOptionCombinationValidator = new OptionCombinationValidator(DEFAULT_OPTION_COMBINATION_RULES.one);
    this.twoOptionCombinationValidator = new OptionCombinationValidator(DEFAULT_OPTION_COMBINATION_RULES.two);
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
    // オプションは、-- から始まるもの
    const params = args.filter(arg => !arg.startsWith('--'));
    const options = this.optionRegistry.extractOptions(args).reduce((acc: Record<string, unknown>, opt: { name: string; value: unknown }) => {
      acc[opt.name] = opt.value;
      return acc;
    }, {} as Record<string, unknown>);

    // 3. パラメータのバリデーション
    // パラメータの数に応じて、バリデーションを行う
    // 3つ同時にバリデーションを行い、それぞれの結果を判定する
    const zeroValidator = new ZeroParamsValidator();
    const oneValidator = new OneParamValidator();
    const twoValidator = new TwoParamsValidator(this.config);

    const zeroResult = zeroValidator.validate(params);
    const oneResult = oneValidator.validate(params);
    const twoResult = twoValidator.validate(params);

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
      } as OneParamResult;
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
      } as TwoParamResult;
    }

    /* 
     * パラメータのバリデーションが失敗した場合は、エラーを返却する
    */
    return {
      type: 'error',
      params: [],
      options: {},
      error: {
        message: zeroResult.errorMessage || oneResult.errorMessage || twoResult.errorMessage || 'Invalid parameter combination',
        code: zeroResult.errorCode || oneResult.errorCode || twoResult.errorCode || 'INVALID_PARAMS',
        category: zeroResult.errorCategory || oneResult.errorCategory || twoResult.errorCategory || 'validation',
      },
    };
  }
}
