import { BaseValidator } from './params/base_validator.ts';
import { ValidationResult } from '../types/validation_result.ts';
import { OptionRule } from '../types/option_rule.ts';

/**
 * セキュリティバリデータ
 * パラメータにシステムを壊す不正な文字列がないかをチェックする
 * それ以上のチェックは不要
 */
export class SecurityValidator extends BaseValidator {
  constructor(optionRule: OptionRule) {
    super();
  }

  /**
   * バリデーションを実行する
   */
  public validate(args: string[]): ValidationResult {
    // シェルコマンド実行の試みを検出
    if (args.some(arg => arg.includes(';') || arg.includes('|') || arg.includes('&'))) {
      return {
        isValid: false,
        validatedParams: args,
        errorMessage: 'Security error: Shell command execution attempt detected',
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