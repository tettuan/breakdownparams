import { OptionRule, ParamsResult, ZeroParamsResult, OneParamResult, TwoParamResult } from '../result/types.ts';
import { SecurityErrorValidator } from '../validator/security_validator.ts';
import { OptionCombinationValidator } from '../validator/options/option_combination_validator.ts';
import { DEFAULT_OPTION_COMBINATION_RULES } from '../validator/options/option_combination_rule.ts';
import { ParserConfig, DEFAULT_CONFIG } from "../types/parser_config.ts";
import { ZeroParamsValidator } from '../validator/zero_params_validator.ts';
import { OneParamValidator } from '../validator/one_param_validator.ts';
import { TwoParamsValidator } from '../validator/two_params_validator.ts';
import { ZeroOptionValidator, OneOptionValidator, TwoOptionValidator } from '../validator/options/option_validator.ts';

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
  private readonly config: ParserConfig;
  /**
   * セキュリティバリデーター
   * パラメータにシステムを壊す不正な文字列がないかをチェックする
   * それ以上のチェックは不要
   */
  private readonly securityValidator: SecurityErrorValidator;
  protected readonly zeroOptionCombinationValidator: OptionCombinationValidator;
  protected readonly oneOptionCombinationValidator: OptionCombinationValidator;
  protected readonly twoOptionCombinationValidator: OptionCombinationValidator;

  constructor(optionRule?: OptionRule, config?: ParserConfig) {
    this.optionRule = optionRule || {
      format: '--key=value',
      validation: {
        customVariables: [],
        emptyValue: 'error',
        unknownOption: 'error',
        duplicateOption: 'error',
        requiredOptions: [],
        valueTypes: ['string'],
      },
      flagOptions: {
        help: 'help',
        version: 'version',
      },
    };
    this.config = config || DEFAULT_CONFIG;

    this.securityValidator = new SecurityErrorValidator(this.optionRule);
    this.zeroOptionCombinationValidator = new OptionCombinationValidator(DEFAULT_OPTION_COMBINATION_RULES.zero);
    this.oneOptionCombinationValidator = new OptionCombinationValidator(DEFAULT_OPTION_COMBINATION_RULES.one);
    this.twoOptionCombinationValidator = new OptionCombinationValidator(DEFAULT_OPTION_COMBINATION_RULES.two);
  }

  /**
   * パラメータを解析する
   */
  public parse(args: string[]): ParamsResult {
    // セキュリティチェック
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

    // パラメータとオプションを分離する
    // パラメータは、オプションではないもの
    // オプションは、-- から始まるもの
    const params = args.filter(arg => !arg.startsWith('--'));
    const options = args.filter(arg => arg.startsWith('--')).reduce((acc, opt) => {
      const [key, value] = opt.slice(2).split('=');
      const cleanKey = key.startsWith('--') ? key.slice(2) : key;
      acc[cleanKey] = value;
      return acc;
    }, {} as Record<string, unknown>);

    /* 
     * // パラメータのバリデーション
     * // パラメータのバリデーションは、パラメータの数に応じて、バリデーションを行う
     * // パラメータの数に応じて、バリデーションを行う
     * 3つ同時にバリデーションを行い、それぞれの結果を判定する
    */
    const zeroValidator = new ZeroParamsValidator();
    const oneValidator = new OneParamValidator();
    const twoValidator = new TwoParamsValidator();

    const zeroResult = zeroValidator.validate(params, this.config);
    const oneResult = oneValidator.validate(params, this.config);
    const twoResult = twoValidator.validate(params, this.config);

    /*
     * 0個の場合
    */
    if (zeroResult.isValid && !oneResult.isValid && !twoResult.isValid) {
      // オプションのバリデーション
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

      // パラメータが0個の場合は、0個の場合のオプションの組み合わせをチェックする
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
     * 1個の場合
    */
    if (!zeroResult.isValid && oneResult.isValid && !twoResult.isValid) {
      // オプションのバリデーション
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

      // パラメータが1個の場合は、1個の場合のオプションの組み合わせをチェックする
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
     * 2個の場合
    */
    if (!zeroResult.isValid && !oneResult.isValid && twoResult.isValid) {
      // オプションのバリデーション
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

      // パラメータが2個の場合は、2個の場合のオプションの組み合わせをチェックする
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
