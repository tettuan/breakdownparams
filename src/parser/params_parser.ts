import {
  OneParamResult,
  OptionRule,
  ParamsResult,
  TwoParamResult,
  ZeroParamsResult,
} from '../result/types.ts';
import { SecurityErrorValidator } from '../validator/security_error_validator.ts';
import { OptionsValidator } from '../validator/options_validator.ts';
import { ZeroParamsValidator } from '../validator/zero_params_validator.ts';
import { OneParamValidator } from '../validator/one_param_validator.ts';
import { TwoParamValidator } from '../validator/two_param_validator.ts';

/**
 * デフォルトのオプションルール
 */
const DEFAULT_OPTION_RULE: OptionRule = {
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
};

/**
 * パラメータパーサー
 */
export class ParamsParser {
  private optionRule: OptionRule;

  constructor(optionRule: OptionRule = DEFAULT_OPTION_RULE) {
    this.optionRule = optionRule;
  }

  /**
   * パラメータを解析する
   * @param args コマンドライン引数
   * @returns 解析結果
   */
  public parse(args: string[]): ParamsResult {
    console.log('[DEBUG] parse: start', args);

    // First, check for security issues
    const securityValidator = new SecurityErrorValidator(this.optionRule);
    const securityResult = securityValidator.validate(args);
    console.log('[DEBUG] securityResult:', securityResult);
    if (!securityResult.isValid) {
      return {
        type: 'error',
        params: [],
        options: {},
        error: securityResult.error,
      } as ParamsResult;
    }

    // Then validate options
    const optionsValidator = new OptionsValidator(this.optionRule);
    const optionsResult = optionsValidator.validate(args);
    console.log('[DEBUG] optionsResult:', optionsResult);
    if (!optionsResult.isValid) {
      return {
        type: 'error',
        params: [],
        options: {},
        error: optionsResult.error,
      } as ParamsResult;
    }

    // Extract options from validated params
    const options: Record<string, string | undefined> = {};
    const params: string[] = [];
    console.log('[DEBUG] validatedParams:', optionsResult.validatedParams);
    for (const arg of optionsResult.validatedParams) {
      if (arg.startsWith('-')) {
        const [key, value] = arg.split('=');
        const normalizedKey = key.replace(/^--/, '');
        console.log('[DEBUG] processing option:', { arg, key, normalizedKey, value });
        // Set flag options in options object with undefined value
        if (this.optionRule.flagOptions[normalizedKey]) {
          options[normalizedKey] = undefined;
        } else {
          options[normalizedKey] = value || '';
        }
      } else {
        console.log('[DEBUG] processing param:', arg);
        params.push(arg);
      }
    }
    console.log('[DEBUG] extracted:', { options, params });

    // Try each parameter validator
    const zeroValidator = new ZeroParamsValidator(this.optionRule);
    const oneValidator = new OneParamValidator(this.optionRule);
    const twoValidator = new TwoParamValidator(this.optionRule);

    // Zero params validator accepts options only
    const zeroResult = zeroValidator.validate(optionsResult.validatedParams);
    console.log('[DEBUG] zeroResult:', zeroResult);
    if (zeroResult.isValid) {
      return {
        type: 'zero',
        params: params,
        options: options,
      } as ZeroParamsResult;
    }

    // One and two params validators only accept params
    const oneResult = oneValidator.validate(params);
    console.log('[DEBUG] oneResult:', oneResult);
    if (oneResult.isValid) {
      return {
        type: 'one',
        params: params,
        options: options,
        demonstrativeType: oneResult.demonstrativeType!,
      } as OneParamResult;
    }

    const twoResult = twoValidator.validate(params);
    console.log('[DEBUG] twoResult:', twoResult);
    if (twoResult.isValid) {
      return {
        type: 'two',
        params: params,
        options: options,
        demonstrativeType: twoResult.demonstrativeType!,
        layerType: twoResult.layerType!,
      } as TwoParamResult;
    }

    // If no validator passes, return error
    return {
      type: 'error',
      params: [],
      options: {},
      error: {
        message: 'Invalid parameters',
        code: 'VALIDATION_ERROR',
        category: 'invalid_params',
      },
    } as ParamsResult;
  }
}
