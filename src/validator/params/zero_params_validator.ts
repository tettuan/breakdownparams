import { BaseValidator } from './base_validator.ts';
import { ValidationResult } from '../../types/validation_result.ts';

/**
 * ゼロパラメータバリデータ
 * パラメータの数が0個であることを検証する
 */
export class ZeroParamsValidator extends BaseValidator {
  /**
   * パラメータを検証する
   * @param params - 検証するパラメータ
   */
  override validate(params: string[]): ValidationResult {
    // パラメータが0個の場合は有効
    if (params.length === 0) {
      return {
        isValid: true,
        validatedParams: [],
      };
    }

    // それ以外は無効
    return {
      isValid: false,
      validatedParams: [],
      errorMessage: 'Expected zero parameters',
      errorCode: 'INVALID_PARAMS',
      errorCategory: 'validation',
    };
  }
}
