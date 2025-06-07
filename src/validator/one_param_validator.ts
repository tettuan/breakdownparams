import { BaseValidator } from './base_validator.ts';
import { ValidationResult } from '../result/types.ts';
import { ParserConfig, DEFAULT_CONFIG } from '../types/parser_config.ts';

/**
 * 1パラメータバリデータ
 * パラメータの数が1個であることを検証する
 */
export class OneParamValidator extends BaseValidator {
  /**
   * パラメータを検証する
   * @param params - 検証するパラメータ
   * @param config - バリデーション設定
   */
  override validate(params: string[], config?: ParserConfig): ValidationResult {
    if (params.length !== 1) {
      return {
        isValid: false,
        validatedParams: params,
        errorMessage: 'Expected exactly one parameter',
        errorCode: 'INVALID_PARAMS',
        errorCategory: 'validation'
      };
    }

    const demonstrativePattern = config?.demonstrativeType?.pattern || DEFAULT_CONFIG.demonstrativeType?.pattern || "^(to|summary|defect)$";
    const isValid = new RegExp(demonstrativePattern).test(params[0]);

    return {
      isValid,
      validatedParams: params,
      demonstrativeType: params[0],
      errorMessage: isValid ? undefined : (config?.demonstrativeType?.errorMessage || DEFAULT_CONFIG.demonstrativeType?.errorMessage || 'Invalid demonstrative type'),
      errorCode: isValid ? undefined : 'INVALID_DEMONSTRATIVE_TYPE',
      errorCategory: isValid ? undefined : 'validation'
    };
  }
}
