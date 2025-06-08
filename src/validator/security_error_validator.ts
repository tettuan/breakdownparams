import { BaseValidator } from './params/base_validator.ts';
import { ValidationResult } from '../result/types.ts';
import { OptionRule } from '../result/types.ts';

/**
 * セキュリティエラーバリデータ
 * パラメータにシステムを壊す不正な文字列がないかをチェックする
 */
export class SecurityErrorValidator extends BaseValidator {
  constructor(optionRule: OptionRule) {
    super();
  }

  /**
   * バリデーションを実行する
   */
  public validate(args: string[]): ValidationResult {
    // セキュリティチェック
    const securityResult = this.checkSecurity(args);
    if (!securityResult.isValid) {
      return securityResult;
    }

    // 位置引数の抽出
    const params = args.filter(arg => !arg.startsWith('--'));

    return {
      isValid: true,
      validatedParams: params,
      errors: [],
    };
  }

  /**
   * セキュリティチェックを実行する
   */
  private checkSecurity(args: string[]): ValidationResult {
    // シェルコマンド実行の試みを検出
    if (args.some(arg => arg.includes(';') || arg.includes('|') || arg.includes('&') || arg.includes('`') || arg.includes('$'))) {
      return {
        isValid: false,
        validatedParams: args,
        errorMessage: 'Security error: Shell command execution attempt detected',
        errorCode: 'SECURITY_ERROR',
        errorCategory: 'security',
      };
    }

    // リダイレクト記号の試みを検出
    if (args.some(arg => arg.includes('>') || arg.includes('<'))) {
      return {
        isValid: false,
        validatedParams: args,
        errorMessage: 'Security error: Redirect symbol detected',
        errorCode: 'SECURITY_ERROR',
        errorCategory: 'security',
      };
    }

    // パストラバーサルの試みを検出
    if (args.some(arg => arg.includes('../') || arg.includes('..\\'))) {
      return {
        isValid: false,
        validatedParams: args,
        errorMessage: 'Security error: Path traversal attempt detected',
        errorCode: 'SECURITY_ERROR',
        errorCategory: 'security',
      };
    }

    return {
      isValid: true,
      validatedParams: args,
      errors: [],
    };
  }
}
