import { ValidationResult } from '../../types/validation_result.ts';

/**
 * バリデータの基本クラス
 * パラメータの検証のみを行う
 */
export abstract class BaseValidator {
  /**
   * パラメータを検証する
   * @param params - 検証するパラメータ
   * @returns 検証結果
   */
  abstract validate(params: string[]): ValidationResult;
}
