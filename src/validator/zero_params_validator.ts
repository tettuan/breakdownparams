import { BaseValidator } from "./base_validator.ts";
import { ValidationResult } from "../result/types.ts";

/**
 * 位置引数なしのバリデーター
 */
export class ZeroParamsValidator extends BaseValidator {
  /**
   * バリデーションを実行する
   * @param args コマンドライン引数
   * @returns バリデーション結果
   */
  public override validate(args: string[]): ValidationResult {
    // オプションのみの場合は成功
    if (args.every(arg => arg.startsWith("--"))) {
      return this.createSuccessResult(args);
    }

    // 位置引数がある場合はエラー
    if (args.some(arg => !arg.startsWith("--"))) {
      return this.createErrorResult(
        "No parameters expected",
        "VALIDATION_ERROR",
        "zero_params"
      );
    }

    return this.createSuccessResult(args);
  }
} 