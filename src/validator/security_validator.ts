import { BaseValidator } from './base_validator.ts';
import { ValidationResult } from '../result/types.ts';
import { OptionRule } from '../result/types.ts';

/**
 * セキュリティエラーバリデータ
 * パラメータにシステムを壊す不正な文字列がないかをチェックする
 * それ以上のチェックは不要
 */
export class SecurityErrorValidator extends BaseValidator {
  constructor(optionRule: OptionRule) {
    super(optionRule);
  }

  /**
   * バリデーションを実行する
   */
  public validate(args: string[]): ValidationResult {
    // シェルコマンド実行の試みを検出
    if (args.some(arg => arg.includes(';') || arg.includes('|') || arg.includes('&'))) {
      return this.createErrorInfo(
        'Security error: Shell command execution attempt detected',
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

    return {
      isValid: true,
      validatedParams: [],
      errors: [],
    };
  }
} 