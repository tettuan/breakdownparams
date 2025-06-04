import { OptionRule, ValidationResult } from '../result/types.ts';

/**
 * バリデーターの基底クラス
 */
export abstract class BaseValidator {
  protected optionRule: OptionRule;

  constructor(optionRule: OptionRule) {
    this.optionRule = optionRule;
  }

  /**
   * バリデーションを実行する
   * @param args コマンドライン引数
   * @returns バリデーション結果
   */
  public abstract validate(args: string[]): ValidationResult;

  /**
   * エラーコードを検証する
   * @param code エラーコード
   * @returns 検証結果
   */
  protected validateErrorCode(code: string): boolean {
    return typeof code === 'string' && code.length > 0;
  }

  /**
   * エラーカテゴリを検証する
   * @param category エラーカテゴリ
   * @returns 検証結果
   */
  protected validateErrorCategory(category: string): boolean {
    return typeof category === 'string' && category.length > 0;
  }

  /**
   * エラー結果を生成する
   * @param message エラーメッセージ
   * @param code エラーコード
   * @param category エラーカテゴリ
   * @returns バリデーション結果
   */
  protected createErrorResult(message: string, code: string, category: string): ValidationResult {
    return {
      isValid: false,
      validatedParams: [],
      error: {
        message,
        code,
        category,
      },
      errorMessage: message,
      errorCode: code,
      errorCategory: category,
    };
  }

  /**
   * 成功結果を生成する
   * @param validatedParams 検証済みパラメータ
   * @returns バリデーション結果
   */
  protected createSuccessResult(validatedParams: string[]): ValidationResult {
    return {
      isValid: true,
      validatedParams,
    };
  }

  protected isValid(result: ValidationResult): boolean {
    return result.isValid;
  }

  protected getValidatedParams(result: ValidationResult): string[] {
    return result.validatedParams || [];
  }
}
