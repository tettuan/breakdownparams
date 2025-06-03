import { BaseValidator } from "./base_validator.ts";
import { ValidationResult } from "../result/types.ts";

/**
 * 位置引数1つのバリデーター
 */
export class OneParamValidator extends BaseValidator {
  /**
   * バリデーションを実行する
   * @param args コマンドライン引数
   * @returns バリデーション結果
   */
  public override validate(args: string[]): ValidationResult {
    if (args.length !== 1) {
      return this.createErrorResult(
        "Exactly one parameter expected",
        "VALIDATION_ERROR",
        "one_param"
      );
    }

    const demonstrativeType = args[0];
    if (!this.isValidDemonstrativeType(demonstrativeType)) {
      return this.createErrorResult(
        "Invalid demonstrative type",
        "VALIDATION_ERROR",
        "demonstrative_type"
      );
    }

    return {
      isValid: true,
      validatedParams: args,
      demonstrativeType,
    };
  }

  /**
   * 単一パラメータをチェックする
   * @param args コマンドライン引数
   * @returns 検証結果
   */
  private checkSingleParam(args: string[]): boolean {
    const params = args.filter(arg => !arg.startsWith('-'));
    return params.length === 1;
  }

  /**
   * パラメータの形式を検証する
   * @param param パラメータ
   * @returns 検証結果
   */
  private validateParamFormat(param: string): boolean {
    return /^[a-z]+$/.test(param);
  }

  /**
   * initコマンドを検証する
   * @param param パラメータ
   * @returns 検証結果
   */
  private validateInitCommand(param: string): boolean {
    return param === 'init';
  }

  private isValidDemonstrativeType(value: string): boolean {
    const validTypes = ["to", "summary", "defect", "init"];
    return validTypes.includes(value);
  }
} 