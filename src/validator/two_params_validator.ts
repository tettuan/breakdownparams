import { BaseValidator } from "./base_validator.ts";
import { ValidationResult } from "../result/types.ts";

/**
 * 位置引数2つのバリデーター
 */
export class TwoParamValidator extends BaseValidator {
  /**
   * バリデーションを実行する
   * @param args コマンドライン引数
   * @returns バリデーション結果
   */
  public override validate(args: string[]): ValidationResult {
    // オプションを除いた位置引数の数をチェック
    const params = args.filter(arg => !arg.startsWith("--"));
    if (params.length !== 2) {
      return this.createErrorResult(
        "Exactly two parameters expected",
        "VALIDATION_ERROR",
        "two_params"
      );
    }

    const [demonstrativeType, layerType] = params;
    if (!this.isValidDemonstrativeType(demonstrativeType)) {
      return this.createErrorResult(
        "Invalid demonstrative type",
        "VALIDATION_ERROR",
        "demonstrative_type"
      );
    }

    if (!this.isValidLayerType(layerType)) {
      return this.createErrorResult(
        "Invalid layer type",
        "VALIDATION_ERROR",
        "layer_type"
      );
    }

    // validatedParams には元の args を返す
    return {
      isValid: true,
      validatedParams: args,
      demonstrativeType,
      layerType,
    };
  }

  /**
   * 指示型の形式を検証する
   * @param value 検証する値
   * @returns 検証結果
   */
  private isValidDemonstrativeType(value: string): boolean {
    const validTypes = ["to"];
    return validTypes.includes(value);
  }

  /**
   * レイヤー型の形式を検証する
   * @param value 検証する値
   * @returns 検証結果
   */
  private isValidLayerType(value: string): boolean {
    const validTypes = ["project", "feature", "story", "task"];
    return validTypes.includes(value);
  }
} 