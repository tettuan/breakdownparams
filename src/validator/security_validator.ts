import { BaseValidator } from './params/base_validator.ts';
import { ValidationResult } from '../types/validation_result.ts';

/**
 * セキュリティバリデータ
 * パラメータにシステムを壊す不正な文字列がないかをチェックする
 * それ以上のチェックは不要
 */
export class SecurityValidator extends BaseValidator {
  constructor() {
    super();
  }

  /**
   * バリデーションを実行する
   */
  public validate(args: string[]): ValidationResult {
    // シェルコマンド実行の試みやリダイレクト記号の検出
    if (args.some(arg => /[;|&<>]/.test(arg))) {
      return {
        isValid: false,
        validatedParams: args,
        errorMessage: 'Security error: Shell command execution or redirection attempt detected',
        errorCode: 'SECURITY_ERROR',
        errorCategory: 'security',
      };
    }

    // パストラバーサルの試みを検出（../, ..\, 直結型も含む）
    if (args.some(arg => /\.\.(\/|\\|[a-zA-Z0-9_\-\.])/g.test(arg))) {
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