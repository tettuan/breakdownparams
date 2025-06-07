import { OneParamResult, OptionRule, ParamsResult, TwoParamResult } from '../result/types.ts';
import { SecurityErrorValidator } from '../validator/security_error_validator.ts';
import { OptionsValidator } from '../validator/options_validator.ts';
import { ZeroParamsValidator } from '../validator/zero_params_validator.ts';
import { OneParamValidator } from '../validator/one_param_validator.ts';
import { TwoParamValidator } from '../validator/two_param_validator.ts';
import { ParamSpecificOptionValidator } from '../validator/param_specific_option_validator.ts';

/**
 * デフォルトのオプションルール
 */
export const DEFAULT_OPTION_RULE: OptionRule = {
  format: '--key=value',
  validation: {
    customVariables: ['uv-project', 'uv-version', 'uv-environment'],
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
  paramSpecificOptions: {
    zero: {
      allowedOptions: ['help', 'version'],
      requiredOptions: [],
    },
    one: {
      allowedOptions: ['help', 'version'],
      requiredOptions: [],
    },
    two: {
      allowedOptions: ['help', 'version'],
      requiredOptions: [],
    },
  },
};

/**
 * パラメータパーサー
 */
export class ParamsParser {
  private securityValidator: SecurityErrorValidator;
  private optionsValidator: OptionsValidator;
  private paramSpecificValidator: ParamSpecificOptionValidator;
  private zeroParamsValidator: ZeroParamsValidator;
  private oneParamValidator: OneParamValidator;
  private twoParamsValidator: TwoParamValidator;
  private optionRule: OptionRule;

  constructor(optionRule: OptionRule = DEFAULT_OPTION_RULE) {
    this.optionRule = optionRule;
    this.securityValidator = new SecurityErrorValidator(optionRule);
    this.optionsValidator = new OptionsValidator(optionRule);
    this.paramSpecificValidator = new ParamSpecificOptionValidator(optionRule);
    this.zeroParamsValidator = new ZeroParamsValidator(optionRule);
    this.oneParamValidator = new OneParamValidator(optionRule);
    this.twoParamsValidator = new TwoParamValidator(optionRule);
  }

  /**
   * パラメータを解析する
   * @param args コマンドライン引数
   * @returns 解析結果
   */
  public parse(args: string[]): ParamsResult {
    console.log('[DEBUG] ParamsParser.parse: start with args:', JSON.stringify(args, null, 2));
    console.log('[DEBUG] ParamsParser.parse: expected format:', this.optionRule.format);

    // First, check for security issues
    const securityResult = this.securityValidator.validate(args);
    console.log(
      '[DEBUG] ParamsParser.parse: securityResult:',
      JSON.stringify(securityResult, null, 2),
    );
    if (!securityResult.isValid) {
      return {
        type: 'error',
        params: [],
        options: {},
        error: {
          message: securityResult.errorMessage || 'Security validation failed',
          code: securityResult.errorCode || 'SECURITY_ERROR',
          category: securityResult.errorCategory || 'security',
        },
      };
    }

    // Then validate options
    const optionsResult = this.optionsValidator.validate(args);
    console.log(
      '[DEBUG] ParamsParser.parse: optionsResult:',
      JSON.stringify(optionsResult, null, 2),
    );
    if (!optionsResult.isValid) {
      return {
        type: 'error',
        params: [],
        options: {},
        error: {
          message: optionsResult.errorMessage || 'Options validation failed',
          code: optionsResult.errorCode || 'VALIDATION_ERROR',
          category: optionsResult.errorCategory || 'validation',
        },
      };
    }

    // Extract options and params
    const validatedParams = optionsResult.validatedParams;
    console.log(
      '[DEBUG] ParamsParser.parse: validatedParams:',
      JSON.stringify(validatedParams, null, 2),
    );

    const options: Record<string, string | undefined> = {};
    const params: string[] = [];

    for (const arg of validatedParams) {
      console.log('[DEBUG] ParamsParser.parse: processing param:', arg);
      if (arg.startsWith('--')) {
        const [key, value] = arg.slice(2).split('=');
        const normalizedKey = key.toLowerCase();
        console.log('[DEBUG] normalizeKey:', {
          original: key,
          normalized: normalizedKey,
        });
        console.log('[DEBUG] isFlagOption check:', {
          option: key,
          normalizedOption: normalizedKey,
          isFlag: this.optionRule.flagOptions[normalizedKey] !== undefined,
          flagOptions: this.optionRule.flagOptions,
        });
        // Set flag options in options object with undefined value
        if (this.optionRule.flagOptions[normalizedKey]) {
          options[normalizedKey] = undefined;
        } else {
          options[normalizedKey] = value || '';
        }
      } else {
        params.push(arg);
      }
    }

    console.log('[DEBUG] ParamsParser.parse: extracted:', { options, params });

    // Validate parameter-specific options
    const paramSpecificResult = this.paramSpecificValidator.validate(args);
    console.log(
      '[DEBUG] ParamsParser.parse: paramSpecificResult:',
      JSON.stringify(paramSpecificResult, null, 2),
    );
    if (!paramSpecificResult.isValid) {
      return {
        type: 'error',
        params: [],
        options: {},
        error: {
          message: paramSpecificResult.errorMessage || 'Parameter-specific validation failed',
          code: paramSpecificResult.errorCode || 'VALIDATION_ERROR',
          category: paramSpecificResult.errorCategory || 'invalid_params',
        },
      };
    }

    // Try each parameter validator
    const zeroResult = this.zeroParamsValidator.validate(params);
    console.log('[DEBUG] ParamsParser.parse: zeroResult:', JSON.stringify(zeroResult, null, 2));
    if (zeroResult.isValid && params.length === 0) {
      return {
        type: 'zero',
        params: [],
        options,
      };
    }

    // One and two params validators only accept params
    const oneResult = this.oneParamValidator.validate(params);
    console.log('[DEBUG] ParamsParser.parse: oneResult:', JSON.stringify(oneResult, null, 2));
    if (oneResult.isValid) {
      return {
        type: 'one',
        params: oneResult.validatedParams,
        options,
        demonstrativeType: oneResult.demonstrativeType || 'this',
      } as OneParamResult;
    }

    const twoResult = this.twoParamsValidator.validate(params);
    console.log('[DEBUG] ParamsParser.parse: twoResult:', JSON.stringify(twoResult, null, 2));
    if (twoResult.isValid) {
      return {
        type: 'two',
        params: twoResult.validatedParams,
        options,
        demonstrativeType: twoResult.demonstrativeType || 'this',
        layerType: twoResult.layerType || 'front',
      } as TwoParamResult;
    }

    // 6. バリデーション結果の組み合わせ判定
    const zeroValid = zeroResult.isValid;
    const oneValid = oneResult.isValid;
    const twoValid = twoResult.isValid;

    // バリデーターの結果とオプションの結果の組み合わせで判定
    if (!zeroValid && oneValid && !twoValid) {
      // Oneパラメータの場合、OneOptionの結果を考慮
      const oneOptionResult = this.paramSpecificValidator.validateForOne(options);
      if (oneOptionResult.isValid) {
        return {
          type: 'one',
          params: params,
          options: options,
          demonstrativeType: oneResult.demonstrativeType,
        } as OneParamResult;
      }
    } else if (!zeroValid && !oneValid && twoValid) {
      // Twoパラメータの場合、TwoOptionの結果を考慮
      const twoOptionResult = this.paramSpecificValidator.validateForTwo(options);
      if (twoOptionResult.isValid) {
        return {
          type: 'two',
          params: params,
          options: options,
          demonstrativeType: twoResult.demonstrativeType,
          layerType: twoResult.layerType,
        } as TwoParamResult;
      }
    }

    // それ以外の組み合わせは全てerror
    return {
      type: 'error',
      params: [],
      options: {},
      error: {
        message: 'Invalid parameter combination',
        code: 'VALIDATION_ERROR',
        category: 'invalid_params',
      },
    };
  }
}
