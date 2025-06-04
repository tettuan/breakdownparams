import { BaseValidator } from './base_validator.ts';
import { ValidationResult } from '../result/types.ts';

/**
 * セキュリティエラーバリデーター
 */
export class SecurityErrorValidator extends BaseValidator {
  /**
   * バリデーションを実行する
   * @param args コマンドライン引数
   * @returns バリデーション結果
   */
  public override validate(args: string[]): ValidationResult {
    // Check for dangerous characters first
    for (const arg of args) {
      if (this.containsDangerousCharacters(arg)) {
        return this.createErrorResult(
          'Invalid characters detected',
          'SECURITY_ERROR',
          'invalid_characters',
          { command: arg },
        );
      }
    }

    // Then check for command injection patterns
    for (const arg of args) {
      if (this.containsCommandInjectionPattern(arg)) {
        return this.createErrorResult(
          'Command injection pattern detected',
          'SECURITY_ERROR',
          'command_injection',
          { command: arg },
        );
      }
    }

    return this.createSuccessResult(args);
  }

  /**
   * 危険な文字を含むかチェックする
   * @param arg チェックする文字列
   * @returns 危険な文字を含む場合はtrue
   */
  private containsDangerousCharacters(arg: string): boolean {
    // オプション形式の = は安全として扱う
    if (arg.startsWith('--') && arg.includes('=')) {
      const [key, value] = arg.split('=');
      // キー部分と値部分を個別にチェック
      return this.isDangerous(key) || this.isDangerous(value);
    }

    // その他の文字列は通常の危険文字チェック
    return this.isDangerous(arg);
  }

  /**
   * 文字列に危険な文字が含まれているかチェックする
   * @param str チェックする文字列
   * @returns 危険な文字を含む場合はtrue
   */
  private isDangerous(str: string): boolean {
    const dangerousChars = /[;&|><`$(){}[\]*?~!@#%^+=]/;
    return dangerousChars.test(str);
  }

  /**
   * コマンドインジェクションパターンを含むかチェックする
   * @param arg チェックする文字列
   * @returns コマンドインジェクションパターンを含む場合はtrue
   */
  private containsCommandInjectionPattern(arg: string): boolean {
    const patterns = [
      /;\s*rm\s+-rf/,
      /\|\s*cat/,
      /&\s*echo/,
      />\s*malicious/,
      /<\s*malicious/,
      /`.*`/,
      /\$PATH/,
      /\(.*\)/,
      /\{.*\}/,
      /\[.*\]/,
    ];
    return patterns.some((pattern) => pattern.test(arg));
  }

  /**
   * エラー結果を作成する
   */
  protected override createErrorResult(
    message: string,
    code: string,
    category: string,
    details?: Record<string, unknown>,
  ): ValidationResult {
    return {
      isValid: false,
      validatedParams: [],
      error: {
        message,
        code,
        category,
      },
      errorDetails: details,
    };
  }

  /**
   * 成功結果を作成する
   */
  protected override createSuccessResult(args: string[]): ValidationResult {
    return {
      isValid: true,
      validatedParams: args,
    };
  }
}
