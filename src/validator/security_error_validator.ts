import { BaseValidator } from './base_validator.ts';
import { ValidationResult } from '../result/types.ts';
import { OptionRule } from '../result/types.ts';

/**
 * セキュリティエラーバリデータ
 */
export class SecurityErrorValidator extends BaseValidator {
  constructor(optionRule: OptionRule) {
    super(optionRule);
  }

  /**
   * バリデーションを実行する
   */
  public override validate(args: string[]): ValidationResult {
    // セキュリティチェック
    const securityResult = this.checkSecurity(args);
    if (!securityResult.isValid) {
      return securityResult;
    }

    // 位置引数の抽出
    const params = this.extractParams(args);

    return {
      isValid: true,
      validatedParams: params,
      errors: [],
    };
  }

  /**
   * セキュリティチェックを実行する
   */
  protected override checkSecurity(args: string[]): ValidationResult {
    // シェルコマンド実行の試みを検出
    if (args.some(arg => arg.includes(';') || arg.includes('|') || arg.includes('&') || arg.includes('`') || arg.includes('$'))) {
      return this.createErrorInfo(
        'Security error: Shell command execution attempt detected',
        'SECURITY_ERROR',
        'security',
      );
    }

    // リダイレクト記号の試みを検出
    if (args.some(arg => arg.includes('>') || arg.includes('<'))) {
      return this.createErrorInfo(
        'Security error: Redirect symbol detected',
        'SECURITY_ERROR',
        'security',
      );
    }

    // パストラバーサルの試みを検出
    if (args.some(arg => arg.includes('../') || arg.includes('..\\'))) {
      return this.createErrorInfo(
        'Security error: Path traversal attempt detected',
        'SECURITY_ERROR',
        'security',
      );
    }

    return this.createSuccessResult(args, []);
  }
}
