import { BaseValidator } from './base_validator.ts';
import { ValidationResult } from '../../types/validation_result.ts';

/**
 * 1パラメータバリデータ
 * パラメータの数が1個であることを検証する
 * init コマンドのみを許可する
 */
export class OneParamValidator extends BaseValidator {
  /**
   * パラメータを検証する
   * @param params - 検証するパラメータ
   */
  override validate(params: string[]): ValidationResult {
    if (params.length !== 1) {
      return {
        isValid: false,
        validatedParams: params,
        errorMessage: 'Expected exactly one parameter',
        errorCode: 'INVALID_PARAMS',
        errorCategory: 'validation',
      };
    }

    const isValid = params[0] === 'init';
    return {
      isValid,
      validatedParams: params,
      demonstrativeType: params[0],
      errorMessage: isValid ? undefined : `Invalid command: ${params[0]}. Only "init" is allowed`,
      errorCode: isValid ? undefined : 'INVALID_COMMAND',
      errorCategory: isValid ? undefined : 'validation',
    };
  }
}
