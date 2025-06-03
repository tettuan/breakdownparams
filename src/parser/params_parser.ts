import { ParamsResult, OptionRule, ZeroParamsResult, OneParamResult, TwoParamResult } from "../result/types.ts";
import { SecurityErrorValidator } from "../validator/security_error_validator.ts";
import { OptionsValidator } from "../validator/options_validator.ts";
import { ZeroParamsValidator } from "../validator/zero_params_validator.ts";
import { OneParamValidator } from "../validator/one_param_validator.ts";
import { TwoParamValidator } from "../validator/two_param_validator.ts";

/**
 * パラメータパーサー
 */
export class ParamsParser {
  private optionRule: OptionRule;

  constructor(optionRule: OptionRule) {
    this.optionRule = optionRule;
  }

  /**
   * パラメータを解析する
   * @param args コマンドライン引数
   * @returns 解析結果
   */
  public parse(args: string[]): ParamsResult {
    // First, check for security issues
    const securityValidator = new SecurityErrorValidator(this.optionRule);
    const securityResult = securityValidator.validate(args);
    if (!securityResult.isValid) {
      return {
        type: "error",
        params: [],
        options: {},
      } as ParamsResult;
    }

    // Then validate options
    const optionsValidator = new OptionsValidator(this.optionRule);
    const optionsResult = optionsValidator.validate(args);
    if (!optionsResult.isValid) {
      return {
        type: "error",
        params: [],
        options: {},
      } as ParamsResult;
    }

    // Try each parameter validator
    const zeroValidator = new ZeroParamsValidator(this.optionRule);
    const oneValidator = new OneParamValidator(this.optionRule);
    const twoValidator = new TwoParamValidator(this.optionRule);

    const zeroResult = zeroValidator.validate(args);
    if (zeroResult.isValid) {
      return {
        type: "zero",
        params: args,
        options: {},
      } as ZeroParamsResult;
    }

    const oneResult = oneValidator.validate(args);
    if (oneResult.isValid) {
      return {
        type: "one",
        params: args,
        options: {},
        demonstrativeType: oneResult.demonstrativeType!,
      } as OneParamResult;
    }

    const twoResult = twoValidator.validate(args);
    if (twoResult.isValid) {
      return {
        type: "two",
        params: args,
        options: {},
        demonstrativeType: twoResult.demonstrativeType!,
        layerType: twoResult.layerType!,
      } as TwoParamResult;
    }

    // If no validator passes, return error
    return {
      type: "error",
      params: [],
      options: {},
    } as ParamsResult;
  }
} 