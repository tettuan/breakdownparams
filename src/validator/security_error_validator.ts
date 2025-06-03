import { BaseValidator } from "./base_validator.ts";
import { ValidationResult } from "../result/types.ts";

/**
 * セキュリティエラーバリデーター
 */
export class SecurityErrorValidator extends BaseValidator {
  /**
   * バリデーションを実行する
   * @param args コマンドライン引数
   * @returns バリデーション結果
   */
  public validate(args: string[]): ValidationResult {
    // Check for command injection patterns
    if (this.containsCommandInjection(args)) {
      return this.createErrorResult(
        "Potential command injection detected",
        "SECURITY_ERROR",
        "command_injection"
      );
    }

    // Check for invalid characters
    if (this.containsInvalidCharacters(args)) {
      return this.createErrorResult(
        "Invalid characters detected",
        "SECURITY_ERROR",
        "invalid_characters"
      );
    }

    return this.createSuccessResult(args);
  }

  /**
   * コマンドインジェクションをチェックする
   * @param args コマンドライン引数
   * @returns 検証結果
   */
  private containsCommandInjection(args: string[]): boolean {
    const dangerousPatterns = [
      /[;&|`$]/,
      /[<>]/,
      /[()]/,
      /[{}]/,
      /[\[\]]/,
    ];

    return args.some(arg => 
      dangerousPatterns.some(pattern => pattern.test(arg))
    );
  }

  /**
   * セキュリティルールを検証する
   * @param args コマンドライン引数
   * @returns 検証結果
   */
  private validateSecurityRules(args: string[]): boolean {
    // パスの正規化チェック
    const hasAbsolutePath = args.some(arg => arg.startsWith('/'));
    if (hasAbsolutePath) {
      return false;
    }

    // 特殊文字のチェック
    const hasSpecialChars = args.some(arg => 
      /[^a-zA-Z0-9\-_\.\/=]/.test(arg)
    );
    if (hasSpecialChars) {
      return false;
    }

    return true;
  }

  private containsInvalidCharacters(args: string[]): boolean {
    const validPattern = /^[a-zA-Z0-9\-_=.,@:]+$/;
    return args.some(arg => !validPattern.test(arg));
  }
} 